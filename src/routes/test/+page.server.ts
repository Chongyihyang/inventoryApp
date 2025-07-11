import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

const DEBUG = true;

const inventoryList = await db
.select()
.from(table.itemsTable)

const users = await db
.select()
.from(table.usersTable)

const departmentList = await db
.select()
.from(table.departmentTable)

function debugPrint(x: string, y) {
	if (DEBUG) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}
}


export const load: PageServerLoad = async ({ locals }) => {
	const user = requireLogin();
	const usersTable1 = alias(table.usersTable, "usersTable1");
    const items = await db
	.select({
		id: table.transactionTable.id,
		itemname: table.itemsTable.itemname,
		itemid: table.itemsTable.id,
		outtime: table.transactionTable.outtime,
		issuer: table.usersTable.username,
		issuerid: table.transactionTable.issuer,
		issuee: usersTable1.username,
		issueeid: table.transactionTable.issuee
	})
	.from(table.transactionTable)
	.leftJoin(table.itemsTable, eq(table.transactionTable.itemid, table.itemsTable.id))
	.leftJoin(table.usersTable, eq(table.usersTable.id, table.transactionTable.issuer))
	.leftJoin(usersTable1, eq(usersTable1.id, table.transactionTable.issuee))
	.where(isNull(table.transactionTable.inttime));

	const currentdept = locals.department;
	const currentuser = locals.user
	console.log(items)
	return { user, items, inventoryList, departmentList, currentdept, currentuser, users };
};

export const actions: Actions = {

	signout: async ({ request }) => {
        // TODO! Check uniqueness of SN1 and SN2
		const data = await request.formData();
        const uniqueMap = new Set();
        const issuee: string = String(data.get('issuee') as FormDataEntryValue).trim();
		const issuer: string = String(data.get('issuer') as FormDataEntryValue).trim();
		const HOTO: string = String(data.get('HOTO') as FormDataEntryValue);

		
		// check that issuee is valid
		let isValidIssuee = false
		debugPrint("users", users)
		users.forEach(x => {
			if (x.id == issuee) {
				isValidIssuee = true
				return
			} 
		})
		
		if (!isValidIssuee) {
			return fail(422, {
				error: "Issuee does not exist",
                action: "signout"
            });
		}
		
    	String(data.get('items') as FormDataEntryValue)
		.trim()
		.split(",")
		.map(x => { if (x != "") uniqueMap.add(x)})

		const item = Array.from(uniqueMap)

		// check that items exists
		if (item.length == 0) {
			return fail(422, {
				error: "No items were scanned",
                action: "signout"
            });
		}		

		// check for any HOTO:
		debugPrint("HOTO", HOTO)
		if (HOTO != "none") {
			let SLOCitem: number | null = 0
			users.forEach(async x => {
				if (x.id == issuee) {
					SLOCitem = x.departmentid
					return
				}
			})
			let params = {};
			debugPrint("SLOCitem", SLOCitem)
			if (HOTO == "temp") {
				params = {
					currentholder: SLOCitem
				}
			} else if (HOTO == "perm") {
				params = {
					currentholder: SLOCitem,
					orignalholder: SLOCitem
				}
			}
			debugPrint("params", params)
			item.forEach(async itemid => await db
				.update(table.itemsTable)
				.set(params)
				.where(eq(table.itemsTable.id, itemid)))
		} else {
			console.log("signout in src/routes/+page.server.ts")
			debugPrint("item signout <in server>", item)
			debugPrint("issuee", issuee)
			item.forEach(async itemid => await db.insert(table.transactionTable)
			.values({
				itemid,
				outtime: Date.now(),
				issuer,
				issuee,		
			}))
		}

        return { success: true }
	},

};

function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, '/login');
	}

	return locals.user;
}