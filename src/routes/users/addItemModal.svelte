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
		currentrole
    } = $props()

	let selected = $state(0)
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
		selected = 0
        addIsOpen = false
    }


</script>

<dialog
	bind:this={dialog}
	onclose={() => (addIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
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
			<h2 class="mr-2 my-auto" id="departmentid">Department: </h2>
			<select class="box overflow-y-auto"  name="departmentid" id="departmentid" required>
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="roleid">Role: </h2>
			<select class="box overflow-y-auto " name="role" id="role" bind:value={selected} required>
				<option value="0" disabled selected>Select an option</option>
				{#each roles as role}
					<!-- svelte-ignore block_empty -->
					{#if (currentrole == "2" && Number(role.id) == 1)}
					{:else}
						<option value="{role.id}">{role.rolename}</option>
					{/if}
				{/each}
			</select>
			{#if selected == 1 || selected == 2}
			<div class="col-span-3">
				<h2>Requirements for password: </h2>
				<p class="text-[10px]">1. Password is between 8 and 30 characters long</p>
				<p class="text-[10px]">2. Consists of at least 1 upper and lowercase character</p>
				<p class="text-[10px]">3. Contains at least 1 symbol and 1 number</p>
			</div>
			<h2 class="mr-2 my-auto" id="passwordhash">Password: </h2>
			<input  class="box" type="password" name="passwordhash" required> 
			<h2 class="mr-2 my-auto" id="passwordhash">Password Retype: </h2>
			<input  class="box" type="password" name="passwordretype" required> 
			{/if}
			<input type="submit" class="submit" name="" id="">
			<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

