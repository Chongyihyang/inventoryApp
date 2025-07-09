<script lang="ts">

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
		roles = $bindable<Roles[]>()
    } = $props()

    let dialog = $state<HTMLDialogElement>()

	$effect(() => {
		if (!dialog) return;

		console.log(editIsOpen)
		if (editIsOpen) {
			dialog.showModal();
		} else if (editIsOpen == false){
			dialog.close()

		}
	})


	function closeModal() {
		editIsOpen = false
		if (document.getElementById("error") != null) {
			document.getElementById("error").innerHTML = ""
		}
	}
</script>


<dialog
bind:this={dialog}
onclose={() => (editIsOpen = false)}
onclick={(e) => { if (e.target === dialog) closeModal()}}
>
	<div class="internal">
		<h2 class="title">Edit properties for {currentSelectedList.username}</h2>
		{#if form?.error && form?.action === 'edit'}
			<p id="error">{form.error}</p>
		{/if}
		<form method="POST" action="?/edit" id="form" autocomplete="off">
			<div class="grid grid-cols-3 gap-y-4">	
				<input  class="box"	type="hidden" name="id" value="{currentSelectedList.id}">
				<h2 class="my-auto grid" id="username">Username: </h2>
				<input  class="box"	type="text" name="username" value="{currentSelectedList.username}" required>
				<h2 class="mr-2 my-auto" id="passwordhash">Edit password: </h2>
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