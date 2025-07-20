<script lang="ts">
	// Types
	type Item = {
		id: string;
		itemname: string;
		SN1: string | null;
		SN2: string | null;
		originalholder: string | null;
		currentholder: number | null;
		remarks?: string;
	};

	type Results = {
		totalItems: number;
		successCount: number;
		errorCount: number;
		successfulItems: Array<Object>;
		failedItems: Array<string>;
		details: Array<string>;
	};

	type Department = {
		id: string;
		departmentname: string;
	};

	type FormData = {
		error?: string;
		action?: 'edit' | 'add' | 'delete';
		success?: boolean;
	};

	type item = {
		id: string;
		itemname: string;
		itemid: string;
		outtime: number;
		issuer: string;
		issuerid: number;
		issuee: string;
		issueeid: number;
	};

	type Transaction = {
		id: string;
		itemname: string;
		SN1: string;
		SN2: string;
		remarks: string;
		currentholder: number;
		originalholder: number;
	};

	type Detail = {
		itemname: string;
		issuee: string | null;
	};

	// Props
	let { data, form } = $props<{
		data: {
			departments: Department[];
			items: Item[];
			currentdept: number | null;
			currentrole: string | null;
		};
		form?: FormData;
	}>();
	const { departments, items, currentdept, currentrole } = data;

	// State
	let scannerBuffer = ''
	let scannerTimeout: NodeJS.Timeout
	const SCANNER_DELAY = 20 // ms
	const scannedItems = new Map<string, number>()
	let barcodeInput: HTMLInputElement
	let statusMessage: HTMLDivElement
	let selecteditems: Item[] = $state([])
	let accounted = $state(0);
	let selecteddept = $state(currentdept)
	let counted = $state(0)

	// Utility Functions
	function filterSelectedItems() {
		selecteditems = items.filter((row: Item) => row.currentholder === selecteddept);
	}

	function showStatus(message: string, isSuccess: boolean) {
		statusMessage.textContent = message;
		statusMessage.style.display = 'block';
		statusMessage.className = isSuccess
			? 'bg-green-800 text-white pl-3 ml-3 rounded-2xl w-[50%]'
			: 'bg-red-800 text-white pl-3 ml-3 rounded-2xl w-[50%]';
		setTimeout(() => (statusMessage.style.display = 'none'), isSuccess ? 3000 : 6000);
	}

	function handleBarcodeScan() {
		filterSelectedItems();
		const barcode: string = scannerBuffer.trim();
		scannerBuffer = '';
		if (!barcode) return;
		const foundItem = selecteditems.find((x) => x.id === barcode);
		if (foundItem) {
			if (!scannedItems.has(barcode)) {
				showStatus(`Added`, true);
				scannedItems.set(barcode, 1);
				const rowElem = document.getElementById(barcode)
				const rowButton = document.querySelector(`input[type="checkbox"][name="${barcode}"]`)
				if (rowElem) {
					rowElem.className = 'hover text-green-400';
					(rowElem as HTMLElement).focus();
				}
				if (rowButton) {
					rowButton.checked = true
				}
				counted += 1
			} else {
				showStatus(`Item already scanned`, false);
			}
		} else {
			showStatus(`Invalid barcode: ${barcode}`, false);
		}
		barcodeInput.focus();
	}

	function receiveScan(e: Event) {
		const target = e.target as HTMLInputElement | null;
		if (!target || !target.value) return;
		scannerBuffer += target.value;
		target.value = '';
		handleBarcodeScan();
		clearTimeout(scannerTimeout);
		scannerTimeout = setTimeout(handleBarcodeScan, SCANNER_DELAY);
	}


	// Effects
	$effect(() => {
		// Reserved for future form state changes
	});

	// Initial population
	filterSelectedItems();
</script>

<div class="form-group mx-auto mt-9 w-fit" id="main">
	<h1>{accounted} / {selecteditems.length}</h1>
	<label for="barcodeInput" class="flex">
		Barcode Scanner Input:
		<div bind:this={statusMessage}></div>
	</label>
	<input
		type="text"
		bind:this={barcodeInput}
		placeholder="Scan items here"
		autocomplete="off"
		class="text"
		oninput={(e) => receiveScan(e)}
	/>
	<br />
	<br />
	<div class="mx-auto max-h-[50vh] w-full overflow-y-auto mb-3">
		<table class="m-0 mx-auto w-full">
			<thead>
				<tr>
					<th>Name</th>
					<th>SN1</th>
					<th>SN2</th>
					<th>Remarks</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each selecteditems as row}
					<tr class="hover" id={row.id}>
						<td><h2 class="font-medium whitespace-nowrap">{row.itemname}</h2></td>
						<td><h2>{row.SN1}</h2></td>
						<td><h2>{row.SN2}</h2></td>
						<td><h2>{row.remarks}</h2></td>
						<td class="p-0">
							<input type="checkbox" 
							name={row.id} onchange="{() => {
								const rowElem = document.getElementById(row.id)
								const rowButton = document.querySelector(`input[type="checkbox"][name="${row.id}"]`)
								if (rowElem && rowButton) {
									if (!rowButton.checked) {
										accounted -= 1
										rowElem.classList.remove("text-green-400");
										rowElem.className = 'text-white'
										scannedItems.delete(row.id)
									} else {
										accounted += 1
										rowElem.className = 'text-green-400'
									}
								}
							}}">
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<button onclick="{() => window.print()}" class="w-full">Submit</button>
</div>

