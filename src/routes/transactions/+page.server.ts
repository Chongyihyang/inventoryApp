import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';



export const load: PageServerLoad = async ({ locals }) => {
	const usersTable1 = alias(table.usersTable, "usersTable1");
    const items = await db
	.select({
		id: table.transactionTable.id,
		itemname: table.itemsTable.itemname,
		itemid: table.itemsTable.id,
		outtime: table.transactionTable.outtime,
		inttime: table.transactionTable.outtime,
		issuer: table.usersTable.username,
		issuerid: table.transactionTable.issuer,
		issuee: usersTable1.username,
		issueeid: table.transactionTable.issuee
	})
	.from(table.transactionTable)
	.leftJoin(table.itemsTable, eq(table.transactionTable.itemid, table.itemsTable.id))
	.leftJoin(table.usersTable, eq(table.usersTable.id, table.transactionTable.issuer))
	.leftJoin(usersTable1, eq(usersTable1.id, table.transactionTable.issuee));

	const departmentList = await db
	.select()
	.from(table.departmentTable)

	const currentdept = locals.department;

	return { items, departmentList, currentdept };
};