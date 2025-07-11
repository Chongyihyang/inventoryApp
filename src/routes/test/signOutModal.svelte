<script lang="ts">

	// Type declaration
	type item = {
		id: string,
		itemname: string,
		itemid: string,
		outtime: number,
		issuer: string,
		issuerid: number,
		issuee: string,
		issueeid: number
	}
	type Transaction = {
		id: string,
		itemname: string,
		SN1: string,
		SN2: string,
		remarks: string,
		currentholder: number,
		originalholder: number,  		
	}
	type Detail = {
		itemname: string,
		issuee: string | null
	}


	// Globals
	let scannerBuffer = ''
	let scannerTimeout: NodeJS.Timeout
	const SCANNER_DELAY = 20 // ms
	const scannedItems = new Map()
	let barcodeInput: HTMLInputElement
	let userNameInput: HTMLInputElement
	let statusMessage: HTMLDivElement
	let formElement: HTMLFormElement
	let dialog: HTMLDialogElement // HTMLDialogElement
	let { signOutModalOpen = $bindable(), data, form } = $props()
	let selectedDept: string = $state("")
	let itemList: Array<string> = $state([])
	let itemDatabase: Record<string, Detail> = {}
	let rows: item[] = $state(data.items)
	let inventoryList: Transaction[] = $state(data.inventoryList)
	inventoryList.map((x) => {
		itemDatabase[x.id] =  {"itemname": x.itemname, "issuee": null}
	})
	rows.map((x) => {
		itemDatabase[x.itemid] = {"itemname": x.itemname, "issuee": x.issuee}
	})
	
	
	$effect(() => {
		if (signOutModalOpen) {
			dialog.showModal()
			itemList = []
			statusMessage.style.display = 'none'
		}
	})
	

	function closeModal() {
		formElement.reset()
		scannedItems.clear()
		dialog.close()
		signOutModalOpen = false
	}


    function handleBarcodeScan() {
        const barcode: string = scannerBuffer.trim()
        scannerBuffer = ''
        if (!barcode) {

            return
        }
        if (itemDatabase && itemDatabase[barcode]) {
            if (!scannedItems.has(barcode)) {
				console.log(itemDatabase[barcode])
                if (itemDatabase[barcode].issuee === null) {
					itemList.push(barcode)
					scannedItems.set(barcode, itemDatabase[barcode])
                    showStatus(`Added: ${itemDatabase[barcode].itemname}`, true)
                } else {
                    showStatus(`Item already signed out by ${itemDatabase[barcode].issuee}: ${itemDatabase[barcode].itemname}`, false)
                }
            } else {
                showStatus(`Item already scanned: ${itemDatabase[barcode]}`, false)
            }
        } else {
            showStatus(`Invalid barcode: ${barcode}`, false)
        }
        barcodeInput.focus()
    }



    function showStatus(message: string, isSuccess: boolean) {
        statusMessage.textContent = message
        statusMessage.style.display = 'block'
        if (isSuccess) {
			statusMessage.className = "bg-green-800 text-white pl-3 ml-3 rounded-2xl w-[40%]"
			setTimeout(() => statusMessage.style.display = 'none', 3000)
        } else {
			statusMessage.className = "bg-red-800 text-white pl-3 ml-3 rounded-2xl w-[40%]"
			setTimeout(() => statusMessage.style.display = 'none', 6000)
		}
    }

	function receiveScan(e: Event) {
		if (e.target === null) return
		if (!(e.target as HTMLInputElement).value) {
			return
		}
		scannerBuffer += (e.target as HTMLInputElement).value;
		(e.target as HTMLInputElement).value = ''
		handleBarcodeScan()
		clearTimeout(scannerTimeout)
		scannerTimeout = setTimeout(handleBarcodeScan, SCANNER_DELAY)
	}

	function reset() {
		scannedItems.clear()
		itemList = []
		userNameInput.value = ""
		showStatus('Cleared all items', true)
		barcodeInput.focus()
	}

</script>

<dialog
	bind:this={dialog}
	onclose={() => (signOutModalOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>

<div class="internal">

	<h1 class="title">Inventory Sign-Out / HOTO Out</h1>
	{#if form?.error && form?.action === 'signout'}
		<p class="error">{form.error}</p>
	{/if}
	<form method="POST" action="?/signout" id="form" bind:this={formElement}>

		<input type="hidden" value="{data.currentuser.id}" name="issuer">

		<div class="form-group">
			<label for="userName">Your Name:</label>
			<input type="text" bind:this={userNameInput} 
			placeholder="Enter your name"  class="text" 
			name="issuee" list="names" required>
			<datalist id="names">
				{#each data.users as user}
					<option value="{user.id}">
						{user.username}
					</option>
				{/each}
			</datalist>
			<input type="hidden" bind:value={selectedDept}>
		</div>
		
		<div class="form-group">
			<label for="barcodeInput">Barcode Scanner Input:</label>
			<input type="text" bind:this={barcodeInput} placeholder="Scan items here" 
			autocomplete="off" class="text"
			oninput="{(e) => receiveScan(e)}">
		</div>

		<div class="form-group w-full">
			<label for="HOTO">HOTO Option:</label>
			<select class="text overflow-y-auto w-full" name="HOTO" id="HOTO">
				<option value="none" selected>No HOTO</option>
				<option value="temp">Temporary HOTO</option>
				<option value="perm">Permanent HOTO</option>
			</select>
		</div>
		
		<div class="form-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<div class="flex">
				<label >Items to Sign Out:</label>
				<div bind:this={statusMessage}></div>
			</div>
			<input type="hidden" name="items" bind:value={itemList}>
			<div id="itemList">
				<div class="empty">
					{#if itemList.length == 0}
						No items scanned yet
					{:else}
					{#each itemList as item}	
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div class="empty text-left px-3 py-2 leading-5 text-gray-500 flex justify-between">
							<div class="text-white">{itemDatabase[item].itemname}</div>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="justify-right cursor-pointer text-red-800" onmousedown="{() => {
								itemList = itemList.filter(x => x != item)
								scannedItems.delete(item)
							}}">✕</div>						
						</div>					
					{/each}
					{/if}
				</div>
			</div>
		</div>
		
		<button id="submitBtn" class="button-normal">Submit Sign-Out</button>
		<button type="button" id="clearBtn" onmousedown="{reset}" class="button-normal">Clear All Items</button>
		<button onmousedown={closeModal} type="button" class="close">close modal</button>
	</form>
</div>

</dialog>