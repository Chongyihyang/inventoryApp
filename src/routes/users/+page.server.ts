import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireLogin } from '$lib';
import { fail } from '@sveltejs/kit';
import { hash } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';

// Type definitions for better type safety
type User = typeof table.itemsTable.$inferSelect;
type Department = typeof table.departmentTable.$inferSelect;
type UserInsert = typeof table.usersTable.$inferInsert;

export async function load({ locals }) {
    const user = requireLogin();
    
    const users = await getUsersWithDepartments();
    const departments = await getAllDepartments();
    const currentdept = Number(locals.department);
    const currentrole = locals.role
    const roles = await getAllRoles();

    return { user, users, departments, currentdept, roles, currentrole };
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,30}$/.test(password)
}

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return id;
}

// Database query functions
async function getUsersWithDepartments() {
    return db
        .select({
            id: table.usersTable.id,
            username: table.usersTable.username,
            rolename: table.rolesTable.rolename,
            roleid: table.usersTable.roleid,
            departmentid: table.usersTable.departmentid
        })
        .from(table.usersTable)
        .leftJoin(
            table.departmentTable, 
            eq(table.departmentTable.id, table.usersTable.departmentid)
        )
        .leftJoin(
            table.rolesTable,
            eq(table.rolesTable.id, table.usersTable.roleid)
        );
}

async function getAllDepartments() {
    return db.select().from(table.departmentTable).orderBy(table.departmentTable.departmentname);
}

async function getAllRoles() {
    return db.select().from(table.rolesTable).orderBy(table.rolesTable.id);
}

// Form validation helpers
async function validateUserName(username: string | undefined) {
    if (username == undefined){
        throw new Error("Username is undefined")
    }
    if (!username.match("^[a-zA-Z0-9]*$")) {
        throw new Error("Usernames must be alphanumeric.");
    }
    // if ((await getUsersWithDepartments()).find(x => x.username == username) != undefined) {
    //     throw new Error("username is not unique!");
    // }
}

function validateDeleteConfirmation(username: string, confirmation: string) {
    if (username !== confirmation) {
        throw new Error("Incorrect username");
    }
}


// Action handlers
export const actions = {

    edit: async (event) => {
        const formData = await event.request.formData();
        const id = formData.get('id')?.toString()?.trim() ?? '';
        const username = formData.get('username')?.toString()?.trim() ?? '';
        let passwordHash = formData.get('passwordhash')?.toString()?.trim();
        const passwordRetype = formData.get('passwordretype')?.toString()?.trim()
        let updateData = {username}
        if (passwordHash != "") {
            updateData["passwordHash"] = passwordHash
        }
        
        
        const roleid = formData.get('role');
        if (roleid != undefined) {
            updateData["roleid"] = roleid
        }
        const departmentid = formData.get('departmentid');
        if (departmentid != undefined) {
            updateData["departmentid"] = departmentid
        }
        
        try {
            validateUserName(username)
            if (passwordHash != passwordRetype) {
                throw new Error("Passwords do not match")
            }
            
            if (!validatePassword(passwordHash) && roleid != "3") {
                return fail(400, { message: 'Password does not meet complexity requirements' });
            }


            if (roleid == "1" || roleid == "2") {
                passwordHash = await hash(passwordHash, {
                    // recommended minimum parameters
                    memoryCost: 19456,
                    timeCost: 2,
                    outputLen: 32,
                    parallelism: 1
                });
                updateData["passwordHash"] = passwordHash
            } else {
                updateData["passwordHash"] = null
            }

            await db
                .update(table.usersTable)
                .set(updateData)
                .where(eq(table.usersTable.id, id));

            return { success: true };
        } catch (error) {
            updateData["id"] = id
            return { error: error instanceof Error ? error.message : "Failed to update item",
                     action: "edit", 
                     updateData
             };
        }
    },

    create: async (event) => {
        try {
            const formData = await event.request.formData()
            const username = formData.get('username')?.toString()?.trim() ?? ''
            let passwordHash = formData.get('passwordhash')?.toString()?.trim()
            const passwordRetype = formData.get('passwordretype')?.toString()?.trim()

            // double entry check
            if (passwordHash != passwordRetype) {
                throw new Error("Passwords do not match")
            }

            if (passwordHash == undefined) {
                passwordHash = ""
            }

            validateUserName(username)
            const roleid = Number(formData.get('role')) || 0
            const departmentid = Number(formData.get('departmentid')) || 0

            if (roleid == 0) {
                throw new Error("Role cannot be null")
            } 

            if (departmentid == 0) {
                throw new Error("Department cannot be null")
            } 
            let user: UserInsert

            if (roleid == 3) {
                user = {
                    id: generateUserId(),
                    username,
                    roleid,
                    departmentid
                };
            } else {
                if (!validatePassword(passwordHash) && passwordHash != "") {
                    throw new Error('Password does not meet complexity requirements')
                }
    
                passwordHash = await hash(passwordHash, {
                    // recommended minimum parameters
                    memoryCost: 19456,
                    timeCost: 2,
                    outputLen: 32,
                    parallelism: 1
                });
    
                user = {
                    id: generateUserId(),
                    username,
                    roleid,
                    departmentid,
                    passwordHash,
                };
            }
            

            await db.insert(table.usersTable).values(user);
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
            const username = data.get('username')?.toString()?.trim();
            const confirmation = data.get('confirmation')?.toString()?.trim();

            if (!id || !username || !confirmation) {
                throw new Error("Missing required fields");
            }

            validateDeleteConfirmation(username, confirmation);

            await db.delete(table.usersTable)
                .where(eq(table.usersTable.id, id));

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