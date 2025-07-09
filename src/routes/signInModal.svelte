<script lang="ts">
	// --- Globals ---
	let scannerBuffer = '';
	let scannerTimeout: NodeJS.Timeout;
	const SCANNER_DELAY = 20; // ms
	const scannedItems = new Map();
	let barcodeInput: HTMLInputElement;
	let itemList: HTMLDivElement;   
	let items: HTMLInputElement;
	let scannerStatus: HTMLDivElement;
	let userNameInput: HTMLInputElement; 
	let statusMessage: HTMLDivElement;
	let { signInModalOpen = $bindable(), data} = $props();
    let rows = $state(data.items)
    let inventoryList = $state(data.inventoryList)
	let itemDatabase = {}

	function debugPrint(x: string, y) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}
	inventoryList.map((x) => {
		itemDatabase[x.itemid] = "1"
	})
	rows.map((x) => {
		itemDatabase[x.itemid] = {"ItemName": x.itemname, "Name": x.issuee, "OutTime": x.outtime}
	})
	let dialog: HTMLDialogElement = $state(); // HTMLDialogElement
	
	function page_reload () {
		window.location.reload()
	}
	
	$effect(() => {
		if (signInModalOpen) dialog.showModal();
	});
	

	function closeModal() {
		document.getElementById("form").reset();
		scannedItems.clear();
		updateItemList();
		userNameInput.value = "";
		dialog.close();	
	}


    function handleBarcodeScan() {
        const barcode: string = scannerBuffer.trim();
        scannerBuffer = '';
        if (!barcode) {
            scannerStatus.textContent = "Scanner ready - scan an item";
            return;
        }
        if (itemDatabase && itemDatabase[barcode]) {
            if (!scannedItems.has(barcode)) {
                if (itemDatabase[barcode] != "1") {
					debugPrint("itemDatabase[barcode]", itemDatabase[barcode])
                    scannedItems.set(barcode, itemDatabase[barcode]);
                    updateItemList();
                    showStatus(`Added: ${barcode}`, true);
                } else {
                    showStatus(`Item not signed out`, false);
                }
            } else {
                showStatus(`Item already scanned: ${barcode}`, false);
            }
        } else {
            showStatus(`Invalid barcode: ${barcode}`, false);
        }
        scannerStatus.textContent = "Scanner ready - scan an item";
        barcodeInput.focus();
    }


    // --- Update Item List ---
    function updateItemList() {
        if (scannedItems.size === 0) {
            itemList.innerHTML = '<div class="empty text-left px-3 py-2 leading-5 text-gray-600">No items scanned yet</div>';
            return;
        }
        itemList.innerHTML = '';
        scannedItems.forEach((item, barcode) => {
			console.log(item)
            const itemDiv = document.createElement('div');
            itemDiv.className = "empty text-left px-3 py-2 leading-5 text-gray-600 flex justify-between";
            itemDiv.innerHTML = `
                <div class="">${item["ItemName"]} - ${item["Name"]}</div>
                <div class="remove-item justify-right cursor-pointer" data-barcode="${barcode}">✕</div>
            `;
            itemList.appendChild(itemDiv);
			items.value +=  barcode + ","
        });
        // Remove item event
        itemList.querySelectorAll('.remove-item').forEach(btn => {
            btn.onclick = function () {
                scannedItems.delete(this.getAttribute('data-barcode'));
                updateItemList();
                showStatus(`Removed: ${this.getAttribute('data-barcode')}`, true);
                barcodeInput.focus();
            };
        });
    }


    function showStatus(message: string, isSuccess: boolean) {
        statusMessage.textContent = message;
        statusMessage.className = isSuccess ? 'success' : 'error';
        statusMessage.style.display = 'block';
        if (isSuccess) {
            setTimeout(() => statusMessage.style.display = 'none', 3000);
        }
    }
</script>

<dialog
	bind:this={dialog}
	onclose={() => (signInModalOpen = false)}
	onclick={(e) => { if (e.target === dialog) closeModal()}}
>
<div class="internal">
	<h1 class="title">Inventory Sign-In / HOTO In</h1>
	
	<form method="POST" action="?/signin" id="form">
		<div class="form-group">
			<input type="hidden" value="{data.currentuser.id}" name="issuer">
			<label for="userName">Your Name:</label>
			<input type="text" bind:this={userNameInput}
			placeholder="Enter your name" name="name" 
			class="text" list="names" required>
			<datalist id="names">
				{#each data.users as user}
					<option data-value="{user.id}">{user.username}</option>
				{/each}
			</datalist>
		</div>
		
		<div class="form-group">
			<label for="barcodeInput">Barcode Scanner Input:</label>
			<div class="mt-2" bind:this={scannerStatus} >Scanner ready - scan an item</div>
			<input type="text" bind:this={barcodeInput} placeholder="Scan items here" 
			autocomplete="off" class="text"
			oninput="{(e) => {
				if (!e.target.value) return;
				scannerBuffer += e.target.value.toUpperCase();
				e.target.value = '';
				scannerStatus.textContent = `Scanning: ${scannerBuffer}`;
				clearTimeout(scannerTimeout);
				scannerTimeout = setTimeout(handleBarcodeScan, SCANNER_DELAY);
			}}">
		</div>

		<div class="form-group flex">
			<label for="SLOCTransfer">SLOC Transfer: </label>
			<input type="checkbox" class="sloc" name="InSLOC">
		</div>
		
		<div class="form-group">
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label>Items to Sign In:</label>
			<div bind:this={statusMessage}></div>
			<input type="hidden" name="items" bind:this={items}>
			<div id="itemList">
				<div class="empty" bind:this={itemList}>No items scanned yet</div>
			</div>
		</div>
		
		
		<button id="submitBtn" onclick="{() => (
			setTimeout(page_reload, 50)
			)}" class="button-normal">Submit Sign-In</button>
		<button type="button" id="clearBtn" onclick="{() => {
			scannedItems.clear();
			updateItemList();
			userNameInput.value = "`";
			showStatus('Cleared all items', true);
			barcodeInput.focus();
		}}" class="button-normal">Clear All Items</button>
		<button onclick={closeModal} type="button" class="close">close modal</button>
	</form>
</div>

</dialog>

