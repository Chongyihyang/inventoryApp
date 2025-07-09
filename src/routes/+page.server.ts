import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

const DEBUG = false;

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

    const inventoryList = await db
	.select()
	.from(table.itemsTable)

	const users = await db
	.select()
	.from(table.usersTable)

	const departmentList = await db
	.select()
	.from(table.departmentTable)

	const currentdept = locals.department;
	const currentuser = locals.user

	return { user, items, inventoryList, departmentList, currentdept, currentuser, users };
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	},

	signout: async ({ request }) => {
        // TODO! Check uniqueness of SN1 and SN2
		const data = await request.formData();
        let uniqueMap = new Set();
        const issuee: string = data.get('name').trim();
		const issuer: string = data.get('issuer').trim();
        let item: string = data.get('items').trim()
		.split(",").map(x => { if (x != "") uniqueMap.add(x)})
        item = Array.from(uniqueMap)
		debugPrint("item signout <in server>", item)
        item.forEach(async itemid => await db.insert(table.transactionTable)
		.values({
			itemid,
			outtime: Date.now(),
			issuer,
			issuee,		
		}))
        return { success: true }
	},

	signin: async ({ cookies, request }) => {
        // TODO! Chec 
		const data = await request.formData();
        let uniqueMap = new Set();
        const issuee: string = data.get('name').trim();
		const issuer: string = data.get('issuer').trim();
        let item: string = data.get('items').trim()
		.split(",").map(x => { if (x != "") uniqueMap.add(x)})
        item = Array.from(uniqueMap)
		debugPrint("item signout <in server>", item)
        item.forEach(async itemid => await db.update(table.transactionTable)
		.set({
			inttime: Date.now(),
		})
		.where(and(
			eq(issuer, table.transactionTable.issuer),
			eq(issuee, table.transactionTable.issuee),
			eq(itemid, table.transactionTable.itemid),
			isNull(table.transactionTable.inttime)),
		))
        return { success: true }
	}
};

function requireLogin() {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		return redirect(302, '/login');
	}

	return locals.user;
}
