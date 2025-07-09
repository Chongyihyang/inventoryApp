import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Type definitions for better type safety
type Item = typeof table.itemsTable.$inferSelect;
type Department = typeof table.departmentTable.$inferSelect;
type ItemInsert = typeof table.itemsTable.$inferInsert;

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

export async function load({ locals }) {
    const user = requireLogin();
    
    const items = await getItemsWithDepartments();
    const departments = await getAllDepartments();
    const currentdept = locals.department;
    console.log("i", departments, currentdept)

    return { user, items, departments, currentdept };
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

// Form validation helpers
function validateItemName(itemname: string | undefined) {
    if (itemname == undefined){
        throw new Error("Item name is undefined")
    }
    if (!itemname.match("^[a-zA-Z0-9]*$")) {
        throw new Error("Item names must be alphanumeric.");
    }
}

function validateDeleteConfirmation(itemname: string, confirmation: string) {
    if (itemname !== confirmation) {
        throw new Error("Incorrect item");
    }
}

// Action handlers
export const actions = {
    edit: async ({ request }) => {
        const data = await request.formData();
        const id = data.get("id")?.toString();
        const updateData = {
            itemname: data.get('itemname')?.toString(),
            SN1: data.get('SN1')?.toString(),
            SN2: data.get('SN2')?.toString(),
            remarks: data.get('remarks')?.toString(),
        };
        
        try {
            validateItemName(updateData.itemname);
            if (!id) throw new Error("Missing item ID");

            await db
                .update(table.itemsTable)
                .set(updateData)
                .where(eq(table.itemsTable.id, id));

            return { success: true };
        } catch (error) {
            updateData["id"] = data.get("id")?.toString()
            return { error: error instanceof Error ? error.message : "Failed to update item",
                     action: "edit", 
                     updateData
             };
        }
    },

    create: async ({ request }) => {
        const data = await request.formData();
        
        try {
            const itemname = data.get('itemname')?.toString()?.trim() ?? '';
            const SN1 = data.get('SN1')?.toString();
            const SN2 = data.get('SN2')?.toString();
            const remarks = data.get('remarks')?.toString();
            const currentholder = data.get('currentholder')?.toString();
            if (currentholder == null) {
                throw new Error("currentholder cannot be null")
            } 
            let originalholder = data.get('originalholder')?.toString();
            if (originalholder == null) {
                throw new Error("originalholder cannot be null")
            } 

            validateItemName(itemname);

            if (!originalholder) {
                originalholder = currentholder;
            }

            const item: ItemInsert = {
                id: generateUserId(),
                itemname,
                SN1,
                SN2,
                currentholder: Number(currentholder),
                originalholder: Number(originalholder),
                remarks
            };

            await db.insert(table.itemsTable).values(item);
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create item";
            return fail(422, {
                error: message,
                action: "add"
            });
        }
    },

    delete: async ({ request }) => {
        const data = await request.formData();
        
        try {
            const id = data.get('id')?.toString()?.trim();
            const itemname = data.get('itemname')?.toString()?.trim();
            const confirmation = data.get('confirmation')?.toString()?.trim();

            if (!id || !itemname || !confirmation) {
                throw new Error("Missing required fields");
            }

            validateDeleteConfirmation(itemname, confirmation);

            await db.delete(table.itemsTable)
                .where(eq(table.itemsTable.id, id));

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete item";
            return fail(422, {
                error: message,
                action: "delete"
            });
        }
    },
};