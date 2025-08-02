import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { department } from "$lib/shared.svelte"
import { getAllDepartments, getCategories, getItemsWithDepartments } from '$lib/utils.js';

// Type definitions for better type safety
// type Item = typeof table.itemsTable.$inferSelect;
// type Department = typeof table.departmentTable.$inferSelect;
type ItemInsert = typeof table.itemsTable.$inferInsert;

interface UpdateData {
    [id: string]: string | number,
}

type Results = {
    totalItems: number,
    successCount: number,
    errorCount: number,
    successfulItems: object[],
    failedItems: object[],
    details: object[]    
}

export async function load({ locals }) {
    const user = requireLogin()
    const categories = await getCategories()
    const items = await getItemsWithDepartments()
    const departments = await getAllDepartments()
    const currentdept = Number(department.current.value)
    const currentrole = locals.role

    return { user, items, departments, currentdept, currentrole, categories };
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

    upload: async ({ request, locals }) => {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userid = formData.get('id_')?.toString()?.trim() ?? '';
        const username = formData.get('username')?.toString()?.trim() ?? '';


        if (!file) {
            return fail(400, { error: 'No file provided' });
        }

        const content = await file.text()
        const rows = content.split(/\r?\n/).filter(row => row.trim() !== '');
        const params: ItemInsert[] = []
        const results: Results = {
            totalItems: 0,
            successCount: 0,
            errorCount: 0,
            successfulItems: [],
            failedItems: [],
            details: []
        };
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        const itemIdsList = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 1;
            const columns = row.split(',');
            
            if (i === 0) continue; // Skip header
            results.totalItems++;
            let isValid = true;
            const messages = [];
            if (columns.length != 7) {
                isValid = false
                messages.push("Row does not have 7 columns")
                continue
            } 
            
            // check itemId
            const itemid = columns[0] ? columns[0].trim() : '';
            if (!itemid) {
                isValid = false;
                messages.push("Missing item ID");
            } 
    
            const SN1 = columns[1] ? columns[1].trim() : '';
            if ((await getItemsWithDepartments()).filter(x => 
                x.SN1 == SN1 && SN1 != "")
                .length != 0) {
                    isValid = false;
                    messages.push("SN1 is not unique");
            }
    
            //check SN2
            const SN2 = columns[2] ? columns[2].trim() : '';
             if (!/^[0-9]*$/.test(SN2) && SN2 != "") {
                isValid = false;
                messages.push("SN2 contains characters other than numerals");
            } else if ((await getItemsWithDepartments()).filter(x => 
                x.SN2 == SN2)
                .length != 0 && SN2 != "") {
                    isValid = false;
                    messages.push("SN2 is not unique");
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
            } else if (locals.role == "2" && locals.department != currentholdertmp){
                isValid = false
                messages.push("current holder is not user's sqn")
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

            let category = 0
            const categoryString = columns[6] ? columns[6].trim() : '';
            if ((await getCategories()).filter(x => x.categoryname == categoryString).length != 1 && categoryString != "") {
                isValid = false;
                messages.push("category name is not in the categorylist");
            } else {
                category = (await getCategories()).filter(x => x.categoryname == categoryString)[0].id
            }
    
            const itemResult = {
                row: rowNumber,
                itemid,
                status: isValid ? "Success" : "Failed",
                SN1,
                SN2,
                remarks,
                messages: messages.join(", ")
            }

            if (isValid) {
                const us = 0
                const toFunc: ItemInsert = {
                    itemname: itemid,
                    SN1,
                    SN2,
                    remarks,
                    currentholder,
                    originalholder,
                    category,
                    us
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
        try {
            // if (params.length != 0) {
            //     await db.transaction(async (tx) => {
            //         await tx.insert(table.itemsTable).values(params).returning();
            //     });
            //     await db.insert(table.logsTable).values({
            //         time: Date.now(),
            //         item: `${userid} / ${username} UPLOADED: ${JSON.stringify(params)}`
            //     })
            // }
            return { success: true, results };
        } catch (error) {
            return fail(500, { error: error instanceof Error ? error.message : "Failed to create item" });
        }
    },

    edit: async ({ request }) => {
        const data = await request.formData()
        const userid = data.get('id_')?.toString()?.trim() ?? ''
        const username = data.get('username')?.toString()?.trim() ?? ''
        const id = Number(data.get("id")?.toString())
        const updateData: UpdateData = {
            itemname: data.get('itemname')?.toString() ?? "",
            SN1: data.get('SN1')?.toString() ?? "",
            SN2: data.get('SN2')?.toString() ?? "",
            remarks: data.get('remarks')?.toString() ?? "",
            category: Number(data.get('category')?.toString() ?? ""),
            us: Number(data.get('us')?.toString() ?? "0"),
        }    
        
        try {

            if ((await getItemsWithDepartments())
                .filter(x => x.id != id)
                .filter(x => x.SN1 == updateData.SN1)
                .length != 0) {
                    throw new Error("SN1 is not unique")
            }
    
            if ((await getItemsWithDepartments())
                .filter(x => x.id != id)
                .filter(x => x.SN2 == updateData.SN2)
                .length > 1) {
                    throw new Error("SN2 is not unique")
            }

            validateItemName(String(updateData.itemname));
            if (!id) throw new Error("Missing item ID");

            await db
                .update(table.itemsTable)
                .set(updateData)
                .where(eq(table.itemsTable.id, id));
            await db.insert(table.logsTable).values({
                time: Date.now(),
                item: `${userid} / ${username} EDITED: ${JSON.stringify((await getItemsWithDepartments()).filter(x => x.id == id))} => ${JSON.stringify(updateData)}`
            })
            return { success: true };
        } catch (error) {
            updateData.id = data.get("id")?.toString() ?? ""
            return { error: error instanceof Error ? error.message : "Failed to update item",
                     action: "edit", 
                     updateData
             };
        }
    },

    create: async ({ request }) => {
        
        try {
            const data = await request.formData();
            const userid = data.get('id_')?.toString()?.trim() ?? '';
            const username = data.get('username')?.toString()?.trim() ?? '';
            const itemname = data.get('itemname')?.toString()?.trim() ?? '';
            const SN1 = data.get('SN1')?.toString();
            const SN2 = data.get('SN2')?.toString();
            const remarks = data.get('remarks')?.toString();
            const currentholder = data.get('currentholder')?.toString();
            const category = Number(data.get('category')?.toString() ?? "");
            const us = Number(data.get('us')?.toString() ?? "0");
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

            const item: ItemInsert = {
                itemname,
                SN1,
                SN2,
                currentholder: Number(currentholder),
                originalholder: Number(originalholder),
                remarks,
                category,
                us
            };

            await db.insert(table.itemsTable).values(item);
			await db.insert(table.logsTable).values({
				time: Date.now(),
				item: `${userid} / ${username} ADDED: ${JSON.stringify(item)}`
			})
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
        try {
            const data = await request.formData();
            
            const userid = data.get('id_')?.toString()?.trim() ?? '';
            const username = data.get('username')?.toString()?.trim() ?? '';
            const id = data.get('id')?.toString()?.trim();
            const SN1 = data.get('SN1')?.toString()?.trim();
            const SN2 = data.get('SN2')?.toString()?.trim();
            const itemname = data.get('itemname')?.toString()?.trim();
            const confirmation = data.get('confirmation')?.toString()?.trim();
    
            if (!id || !itemname || !confirmation) {
                throw new Error("Missing required fields");
            }
    
            validateDeleteConfirmation(itemname, confirmation);
            await db.delete(table.itemsTable)
                .where(eq(table.itemsTable.id, id));
            await db.insert(table.logsTable).values({
                time: Date.now(),
                item: `${userid} / ${username} DELETED ${id}: ${itemname} / ${SN1} / ${SN2}`
            })
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