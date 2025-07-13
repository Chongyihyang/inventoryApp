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
<<<<<<< HEAD
type Param = {
    id: string,
    itemname: string,
    SN1: string,
    SN2: string,
    remarks: string,
    currentholder: number,
    originalholder: number
}
=======
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}



export async function load({ locals }) {
<<<<<<< HEAD
    requireLogin()
    
    const items = await getItemsWithDepartments()
    const departments = await getAllDepartments()
    const currentdept = locals.department
    const currentrole = locals.role

    return { items, departments, currentdept, currentrole };
=======
    const user = requireLogin();
    
    const items = await getItemsWithDepartments();
    const departments = await getAllDepartments();
    const currentdept = locals.department;

    return { user, items, departments, currentdept };
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
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

<<<<<<< HEAD
    upload: async ({ request, locals }) => {
=======
    upload: async ({ request }) => {
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
        const formData = await request.formData();
        const file = formData.get('file') as File;


        if (!file) {
            return fail(400, { error: 'No file provided' });
        }

        try {
            const content = await file.text()
            const rows = content.split(/\r?\n/).filter(row => row.trim() !== '');
<<<<<<< HEAD
            const params: Param[] = []
=======
            const params = []
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
            const results = {
                totalItems: 0,
                successCount: 0,
                errorCount: 0,
                successfulItems: [],
                failedItems: [],
                details: []
            };
            const alphanumericRegex = /^[a-zA-Z0-9]+$/;
<<<<<<< HEAD
            const itemIdsList = [];
=======
            let itemIdsList = [];
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowNumber = i + 1;
                const columns = row.split(',');
                if (i === 0) continue; // Skip header
                results.totalItems++;
                let isValid = true;
<<<<<<< HEAD
                const messages = [];
=======
                let messages = [];
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
        
                // check itemId
                const itemid = columns[0] ? columns[0].trim() : '';
                if (!itemid) {
                    isValid = false;
                    messages.push("Missing item ID");
                } else if (!alphanumericRegex.test(itemid)) {
                    isValid = false;
                    messages.push("Item ID contains invalid characters");
                }
        
                const SN1 = columns[1] ? columns[1].trim() : '';
<<<<<<< HEAD
                if ((await getItemsWithDepartments()).filter(x => 
                    x.SN1 == SN1)
                    .length != 0) {
                        isValid = false;
                        messages.push("SN1 is not unique");
                }
=======
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
        
                //check SN2
                const SN2 = columns[2] ? columns[2].trim() : '';
                 if (!/^[0-9]*$/.test(SN2)) {
                    isValid = false;
                    messages.push("SN2 contains characters other than numerals");
<<<<<<< HEAD
                } else if ((await getItemsWithDepartments()).filter(x => 
                    x.SN2 == SN2)
                    .length != 0) {
                        isValid = false;
                        messages.push("SN2 is not unique");
=======
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
                }
        
                const currentholdertmp = columns[3] ? columns[3].trim() : '';
                let currentholder = 0
                 if (!alphanumericRegex.test(currentholdertmp)) {
                    isValid = false;
                    messages.push("currentholder contains characters other than numerals");
                } else if ((await getAllDepartments()).filter(x => 
                    x.departmentname == currentholdertmp)
                    .length != 1) {
                    isValid = false
                    messages.push("Cannot find department for current holder")
<<<<<<< HEAD
                } else if (locals.role == "2" && locals.department != currentholdertmp){
                    isValid = false
                    messages.push("current holder is not user's sqn")
=======
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
                } else {
                    currentholder = (await getAllDepartments()).filter(x => 
                        x.departmentname == currentholdertmp)[0].id
                }
        
        
                const originalholdertmp = columns[4] ? columns[4].trim() : '';
                let originalholder = 0
                 if (!alphanumericRegex.test(originalholdertmp)) {
                    isValid = false;
                    messages.push("originalholder contains characters other than numerals");
                } else if ((await getAllDepartments()).filter(x => 
                    x.departmentname == originalholdertmp)
                    .length != 1) {
                    isValid = false
                    messages.push("Cannot find department for original holder")
                } else {
                    originalholder = (await getAllDepartments()).filter(x => 
                        x.departmentname == originalholdertmp)[0].id
                }
        
                const remarks = columns[5] ? columns[5].trim() : '';
        
                const itemResult = {
                    row: rowNumber,
                    itemid,
                    status: isValid ? "Success" : "Failed",
                    SN1,
                    SN2,
                    remarks,
                    messages: messages.join(", ")
                };
                if (isValid) {
<<<<<<< HEAD
                    const toFunc: Param = {
=======
                    const toFunc = {
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
                        id: generateUserId(),
                        itemname: itemid,
                        SN1,
                        SN2,
                        remarks,
                        currentholder,
                        originalholder
                    }
                    params.push(toFunc)
                    results.successCount++;
                    results.successfulItems.push(itemResult);
                    itemIdsList.push(itemid);
                } else {
                    results.errorCount++;
                    results.failedItems.push(itemResult);
                }
                results.details.push(itemResult);
            }
<<<<<<< HEAD
            if (params.length != 0) {
                await db.transaction(async (tx) => {
                    console.log("in transaction")
                    const x = await tx.insert(table.itemsTable).values(params).returning();
                    console.log(x)
                });
            }
=======
            await db.transaction(async (tx) => {
                console.log("in transaction")
                const x = await tx.insert(table.itemsTable).values(params).returning();
                console.log(x)
            });
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
            return { success: true, results };
        } catch (error) {
            console.log(error)
            return fail(500, { error: error instanceof Error ? error.message : "Failed to create item" });
        }
    },

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

<<<<<<< HEAD
            if ((await getItemsWithDepartments()).filter(x => 
                x.SN1 == SN1)
                .length != 0) {
                    throw new Error("SN1 is not unique")
            }

            if ((await getItemsWithDepartments()).filter(x => 
                x.SN2 == SN2)
                .length != 0) {
                    throw new Error("SN2 is not unique")
            }

=======
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
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