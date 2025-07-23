import { db } from "$lib/server/db/index.js"
import * as table from '$lib/server/db/schema'
import { department } from "$lib/shared.svelte.js";

export async function load({ locals }) {
	
	async function getDepartmentList() {
		return db.select().from(table.departmentTable);
	}
	
	return {
		user: locals.user,
		dept: locals.department,
		departmentList: await getDepartmentList(),
	};
}
