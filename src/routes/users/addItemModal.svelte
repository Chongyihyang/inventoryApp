<script lang="ts">
	// done refactoring add logic
	// init types
    type Department = {
        id: string
        departmentname: string
    }

    type Roles = {
        id: string
        rolename: string
    }

    type FormData = {
        error?: string
    }

    // Props with type annotations
    let { 
        addIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
        departments = $bindable<Department[]>(),
		roles = $bindable<Roles[]>(),
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	// Effect to handle modal open/close
	$effect(() => {
		if (!dialog) return
		
		if (addIsOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}
    })

    function closeModal() {
        addIsOpen = false
    }


</script>

<dialog
	bind:this={dialog}
	onclose={() => (addIsOpen = false)}
	onclick={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
	<h2 class="title">Create new user</h2>	
	<!-- Only show error if it's from the add action -->
	{#if form?.error && form?.action === 'add'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/create" id="form" autocomplete="off">
		<div class="grid grid-cols-3 gap-y-4">
			<h2 class="my-auto grid" id="username">Username: </h2>
			<input  class="box"	 type="text" name="username" required>
			<h2 class="mr-2 my-auto" id="passwordhash">Password: </h2>
			<input  class="box" type="password" name="passwordhash"> 
			<h2 class="mr-2 my-auto" id="roleid">Role: </h2>
			<select class="box overflow-y-auto " name="role" id="role" required>
				<option value="" disabled selected>Select an option</option>
				{#each roles as role}
					<option value="{role.id}">{role.rolename}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="departmentid">Department: </h2>
			<select class="box overflow-y-auto"  name="departmentid" id="departmentid" required>
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<input type="submit" class="submit" name="" id="">
			<button type="button" onclick={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

