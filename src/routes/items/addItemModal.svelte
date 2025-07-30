<script lang="ts">
	// done refactoring add logic
	// init types
    type Department = {
        id: string
        departmentname: string
    }

    type FormData = {
        error?: string
    }

    // Props with type annotations
    let { 
        addIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
        departments = $bindable<Department[]>(),
		user = $bindable()
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
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
	<h2 class="title">Create new item</h2>	
	<!-- Only show error if it's from the add action -->
	{#if form?.error && form?.action === 'add'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/create" id="form">
		<div class="grid grid-cols-3 gap-y-4">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
			<h2 class="my-auto grid" id="itemname">New item name: </h2>
			<input  class="box"	 type="text" name="itemname" autocomplete="off" required>
			<h2 class="mr-2 my-auto" id="SN1">SN1: </h2>
			<input  class="box" type="text" name="SN1" autocomplete="off"> 
			<h2 class="mr-2 my-auto" id="SN2">SN2: </h2>
			<input  class="box" type="text" name="SN2" autocomplete="off"> 
			<h2 class="mr-2 my-auto" id="SLOCHolder">currentholder: </h2>
			<select class="box overflow-y-auto"  name="currentholder" id="currentholder" required>
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<h2 class="mr-2 my-auto" id="originalholder">originalholder: </h2>
			<select class="box overflow-y-auto " name="originalholder" id="originalholder">
				<option value="" disabled selected>Select an option</option>
				{#each departments as department}
					<option value="{department.id}">{department.departmentname}</option>
				{/each}
			</select>
			<h2 class="mr-2" id="remarks">remarks: </h2>
			<textarea class="box overflow-y-auto h-30" name="remarks" id="remarks"></textarea>
			<input type="submit" class="submit" name="" id="">
			<button type="button" onmousedown={closeModal} class="col-span-3">close modal</button>
		</div>
	</form><br>
</div>

</dialog>

