import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';




export async function load({ locals }) {
    requireLogin()
    
    const items = await getItemsWithDepartments()
    const departments = await getAllDepartments()
    const currentdept = Number(locals.department)
    const currentrole = locals.role

    return { items, departments, currentdept, currentrole };
}

// Database query functions
async function getItemsWithDepartments() {
    return db
        .select({
            id: table.itemsTable.id,
            itemname: table.itemsTable.itemname,
            SN1: table.itemsTable.SN1,
            SN2: table.itemsTable.SN2,
            remarks: table.itemsTable.remarks,
            originalholder: table.departmentTable.departmentname,
            currentholder: table.itemsTable.currentholder,
        })
        .from(table.itemsTable)
        .leftJoin(
            table.departmentTable, 
            eq(table.departmentTable.id, table.itemsTable.originalholder)
        );
}

async function getAllDepartments() {
    return db.select().from(table.departmentTable).orderBy(table.departmentTable.departmentname);
}


// Action handlers
export const actions = {

};