<script lang="ts">

	// init types
	type Item = {
		id: string;
		itemname: string;
		[key: string]: unknown; // For other potential properties
	};

    type FormData = {
        error?: string
    }

	// Props with type annotations
	let { 
		editIsOpen = $bindable<boolean>(),
		form = $bindable<FormData>(),
		currentSelectedList = $bindable<Item[]>()
    } = $props()
	
    let dialog = $state<HTMLDialogElement>()
	$effect(() => {
		console.log(currentSelectedList, "i")
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
		<h2 class="title">Edit properties for {currentSelectedList.itemname}</h2>
		{#if form?.error && form?.action === 'edit'}
			<p id="error">{form.error}</p>
		{/if}
		<form method="POST" action="?/edit" id="form_edit">
			<div class="grid grid-cols-3 gap-y-4">
				<input type="hidden" name="id" value="{currentSelectedList.id}">
				<h2 class="my-auto grid" >Edit item name: </h2>
				<input  class="box"	 type="text" name="itemname" autocomplete="off"
				required value="{currentSelectedList.itemname}" id="itemname">
				<h2 class="mr-2 my-auto" id="SN1" >SN1: </h2>
				<input  class="box" type="text" name="SN1"
				value="{currentSelectedList.SN1}" autocomplete="off"> 
				<h2 class="mr-2 my-auto" id="SN2">SN2: </h2>
				<input  class="box" type="text" name="SN2"
				value="{currentSelectedList.SN2}" autocomplete="off"> 
				<h2 class="mr-2" id="remarks">remarks: </h2>
				<textarea class="box h-20 overflow-y-auto" 
				name="remarks" id="remarks">{currentSelectedList.remarks}</textarea>
				<input type="submit" class="submit" name="" id="">
				<button type="button" onclick={closeModal} class="col-span-3">close modal</button>
			</div>
		</form><br>
	</div>

</dialog>