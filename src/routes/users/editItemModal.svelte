<script lang="ts">
	import type {  usersTable } from "$lib/server/db/schema";


	// init types
	type User = {
        id: string
        username: string
        rolename: string
        departmentid: number
	};

    type Roles = {
        id: string
        rolename: string
    }

    type Department = {
        id: string
        departmentname: string
    }

    type FormData = {
        error?: string
    }

	// Props with type annotations
	let { 
		editIsOpen = $bindable<boolean>(),
		form = $bindable<FormData>(),
		currentSelectedList = $bindable<User[]>(),
		departments = $bindable<Department[]>(),
		roles = $bindable<Roles[]>(),
		users = $bindable<User[]>(),
		currentrole
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	let error = $state<HTMLParagraphElement>()
	let selected = $state(currentSelectedList.roleid)
	
	$effect(() => {
		if (!dialog) return;
		
		console.log(editIsOpen)
		if (editIsOpen) {
			dialog.showModal();
			selected = currentSelectedList.roleid
		} else if (editIsOpen == false){
			dialog.close()

		}
	})


	function closeModal() {
		editIsOpen = false
		if (error != null) {
			error.innerHTML = ""
		}
	}
</script>


<dialog
bind:this={dialog}
onclose={() => (editIsOpen = false)}
onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
	<div class="internal">
		<h2 class="title">Edit properties for {currentSelectedList.username}</h2>
		{#if form?.error && form?.action === 'edit'}
			<p bind:this={error}>{form.error}</p>
		{/if}
		<form method="POST" action="?/edit" id="form" autocomplete="off">
			<div class="grid grid-cols-3 gap-y-4">	
				<input  class="box"	type="hidden" name="id" value="{currentSelectedList.id}">
				<h2 class="my-auto grid" id="username">Username: </h2>
				<input  class="box"	type="text" name="username" value="{currentSelectedList.username}" required>
				<h2 class="mr-2 my-auto" id="departmentid">Department: </h2>
				<select class="box overflow-y-auto"  name="departmentid" id="departmentid" required>
					{#each departments as department}
						{#if department.id === currentSelectedList.departmentid}
							<option value="{department.id}" selected>{department.departmentname}</option>
						{:else}
							<option value="{department.id}">{department.departmentname}</option>
						{/if}
					{/each}
				</select>
				<h2 class="mr-2 my-auto" id="roleid">Role: </h2>
				<select class="box overflow-y-auto " name="role" id="role" required bind:value={selected}>
					{#each roles as role}
						<option value="{role.id}">{role.rolename}</option>
					{/each}
				</select> 
				{#if selected == '1' || selected == "2"}
					<h2 class="mr-2 my-auto" id="passwordhash">Edit password: </h2>
					<input  class="box" type="password" name="passwordhash"> 
					<h2 class="mr-2 my-auto" id="passwordhash">Password Retype: </h2>
					<input  class="box" type="password" name="passwordretype" required> 
				{/if}
				<input type="submit" class="submit" name="" id="">
				<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
			</div>
		</form><br>
	</div>

</dialog>