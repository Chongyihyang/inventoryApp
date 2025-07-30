import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, isNull, lt } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

const DEBUG = false

function debugPrint(x: string, y: unknown) {
	if (DEBUG) {
		console.log(`${x}: \n---------------------`);
		console.log(y);
		console.log("--------END---------");
	}
}

async function getInventoryList() {
	return db.select().from(table.itemsTable);
}

async function getUsers() {
	return db.select().from(table.usersTable);
}

async function getDepartmentList() {
	return db.select().from(table.departmentTable);
}

async function getItems() {
	const usersTable1 = alias(table.usersTable, "usersTable1");
	const usersTable2 = alias(table.usersTable, "usersTable2");
	return db
		.select({
			id: table.transactionTable.id,
			itemname: table.itemsTable.itemname,
			itemid: table.itemsTable.id,
			outtime: table.transactionTable.outtime,
			issuer: table.usersTable.username,
			issuerid: table.transactionTable.issuer,
			issuerdept: usersTable1.departmentid,
			issuee: usersTable2.username,
			issueeid: table.transactionTable.issuee
		})
		.from(table.transactionTable)
		.leftJoin(table.itemsTable, eq(table.transactionTable.itemid, table.itemsTable.id))
		.leftJoin(table.usersTable, eq(table.usersTable.id, table.transactionTable.issuer))
		.leftJoin(usersTable1, eq(usersTable1.id, table.transactionTable.issuer))
		.leftJoin(usersTable2, eq(usersTable2.id, table.transactionTable.issuee))
		.where(isNull(table.transactionTable.inttime));
}

async function cleanupOldTransactions() {
	await db
		.delete(table.transactionTable)
		.where(lt(table.transactionTable.outtime, Date.now() - 2629800000));
}

function requireLogin() {
	const { locals } = getRequestEvent();
	if (!locals.user) {
		return redirect(302, '/login');
	}
	return locals.user;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = requireLogin();

	const [inventoryList, users, departmentList, items] = await Promise.all([
		getInventoryList(),
		getUsers(),
		getDepartmentList(),
		getItems()
	]);

	await cleanupOldTransactions();

	const currentdept = Number(locals.department);
	const currentuser = locals.user;
	const currentrole = locals.role;
	console.log(items)

	return {
		user,
		items,
		inventoryList,
		departmentList,
		currentdept,
		currentuser,
		users,
		currentrole
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);
		await db.insert(table.logsTable).values({
			time: Date.now(),
			item: `${event.locals.user?.username} LOGGED OUT`
		})
		return redirect(302, '/login');
	},

	signout: async ({ request }) => {
		
		try {
			const data = await request.formData();
			const uniqueMap = new Set<string>();
			const issuee = String(data.get('issuee') ?? '').trim();
			const issuer = String(data.get('issuer') ?? '').trim();
			const HOTO = String(data.get('HOTO') ?? '');
	
			const users = await getUsers();
	
			const isValidIssuee = users.some(x => x.id == issuee);
	
			if (!isValidIssuee) {
				return fail(422, {
					error: "Issuee does not exist",
					action: "signout"
				});
			}
	
			String(data.get('items') ?? '')
				.trim()
				.split(",")
				.forEach(x => { if (x !== "") uniqueMap.add(x); });
	
			const items = Array.from(uniqueMap);
	
			if (items.length === 0) {
				throw new Error("No items were scanned");
			}

			debugPrint("HOTO", HOTO);
	
			if (HOTO !== "none") {
				let SLOCitem: number | null = null;
				const user = users.find(x => x.id == issuee);
				if (user) {
					SLOCitem = user.departmentid;
				}
				let params: Record<string, unknown> = {};
				debugPrint("SLOCitem", SLOCitem);
				if (HOTO === "temp") {
					params = {
						currentholder: SLOCitem
					};
				} else if (HOTO === "perm") {
					params = {
						currentholder: SLOCitem,
						orignalholder: SLOCitem
					};
				}
				debugPrint("params", params);
				await Promise.all(
					items.map(itemid =>
						db
							.update(table.itemsTable)
							.set(params)
							.where(eq(table.itemsTable.id, itemid))
					)
				);
			} else {
				debugPrint("item signout <in server>", items);
				debugPrint("issuee", issuee);
				await Promise.all(
					items.map(async itemid => {
						await db.transaction(async (tx) => {
							await tx
								.insert(table.transactionTable)
								.values({
									itemid,
									outtime: Date.now(),
									issuer,
									issuee,
								})
						});
					})
				);
			}
	
			return { success: true };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Failed to create item";
			return fail(422, {
				error: message,
				action: "add"
			});
		}

	},

	signin: async ({ request }) => {
		const data = await request.formData();
		const uniqueMap = new Set<string>();
		const issuee = String(data.get('issuee') ?? '').trim();
		const issuer = String(data.get('issuer') ?? '').trim();

		const users = await getUsers();

		const isValidIssuee = users.some(x => x.id == issuee);

		if (!isValidIssuee) {
			return fail(422, {
				error: "Issuee does not exist",
				action: "signin"
			});
		}

		String(data.get('items') ?? '')
			.trim()
			.split(",")
			.forEach(x => { if (x !== "") uniqueMap.add(x); });

		const items = Array.from(uniqueMap);

		if (items.length === 0) {
			return fail(422, {
				error: "No items were scanned",
				action: "signin"
			});
		}

		debugPrint("item signout <in server>", items);

		await Promise.all(
			items.map(itemid =>
				db.update(table.transactionTable)
					.set({
						inttime: Date.now(),
					})
					.where(and(
						eq(issuer, table.transactionTable.issuer),
						eq(issuee, table.transactionTable.issuee),
						eq(itemid, table.transactionTable.itemid),
						isNull(table.transactionTable.inttime)
					))
			)
		);

		return { success: true };
	}
};
