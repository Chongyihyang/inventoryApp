<script lang="ts">


	type Results = {
<<<<<<< HEAD
		totalItems: number,
		successCount: number,
		errorCount: number,
		successfulItems: Array<string>,
		failedItems: Array<string>,
		details: Array<string>
=======
            totalItems: number,
            successCount: number,
            errorCount: number,
            successfulItems: Array<string>,
            failedItems: Array<string>,
            details: Array<string>
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
    };

    // Props with type annotations
    let { 
        importIsOpen = $bindable<boolean>(),
        form = $bindable<FormData>(),
		importResults = $bindable<Results>(),
    } = $props()

    let dialog = $state<HTMLDialogElement>()
	// Effect to handle modal open/close
	$effect(() => {
<<<<<<< HEAD
		if (!dialog) return;

=======
        if (importResults) {
            console.log("Results updated:", importResults);
        }

		if (!dialog) return
		
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
		if (importIsOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}

    })

    function closeModal() {
        importIsOpen = false
    }


</script>

<dialog
	bind:this={dialog}
	onclose={() => (importIsOpen = false)}
	onmousedown={(e) => { if (e.target === dialog) closeModal()}}
>
<div id="importResultsModal" class="modal">
	<div class="modal-content">
		<div class="modal-header">
			<span class="modal-title" id="modalTitle">Import Results ({importResults.successCount} success,
				{importResults.errorCount} errors)
			</span>
<<<<<<< HEAD
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span class="close-btn" id="closeModalBtn" onclick="{closeModal}">&times;</span>
=======
			<span class="close-btn" id="closeModalBtn" onclick="{importIsOpen = false}">&times;</span>
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
		</div>
		<div id="importSummary" class="results-section">
			<p>Total items processed: <strong>{importResults.totalItems}</strong></p>
			<p>Successfully imported: <strong style="color: #0d652d;">{importResults.successCount}</strong></p>
			<p>Failed imports: <strong style="color: #c5221f;">{importResults.errorCount}</strong></p>
		</div>
		<div class="results-section">
			<div class="results-title">Successful Imports</div>
			<div id="successfulImports">
				{#if importResults.successfulItems.length === 0}
					<p>No items were successfully imported</p>
				{:else}
					{#each importResults.successfulItems.slice(0,5) as i}
						<div>{i.itemid}</div>
					{/each}
					{#if importResults.successfulItems.length > 5}
						<p>{importResults.successfulItems.length - 5} more items</p>
					{/if}
				{/if}
			</div>
		</div>
		<div class="results-section">
			<div class="results-title">Failed Imports</div>
			<div id="failedImports">
				{#if importResults.failedItems.length === 0}
					<p>No items failed to imported</p>
				{:else}
					{#each importResults.failedItems.slice(0,5) as i}
						<div>{i.itemid}</div>
					{/each}
					{#if importResults.failedItems.length > 5}
						<p>{importResults.failedItems.length - 5} more errors</p>
					{/if}
				{/if}
			</div>
		</div>
		<div class="results-section">
			<div class="results-title">Import Details</div>
			<table class="results-table">
				<thead>
					<tr>
						<th>Row</th>
						<th>Item ID</th>
						<th>Status</th>
						<th>Message</th>
					</tr>
				</thead>
				<tbody id="importDetails">
						{#each importResults.details as item}
							<tr>
								<td>{item.row}</td>
								<td>{item.itemid}</td>
								<td>{item.status}</td>
								<td>{item.messages || "-"}</td>
							</tr>
						{/each}
				</tbody>
			</table>
		</div>
		<button class="btn" id="closeModalBtn2" 
<<<<<<< HEAD
		style="margin-top: 20px;" onclick="{closeModal}">Close</button>
=======
		style="margin-top: 20px;", onclick="{importIsOpen = false}">Close</button>
>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
	</div>
</div>

</dialog>

<style>
	:root {
		--primary-color: #4285f4;
		--danger-color: #ea4335;
		--success-color: #34a853;
		--warning-color: #fbbc05;
		--light-gray: #f5f5f5;
		--medium-gray: #e0e0e0;
		--dark-gray: #757575;
		--text-color: #212121;
	}


	.btn {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-radius: 4px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		text-decoration: none;
	}

	.btn:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	th,
	td {
		padding: 12px 15px;
		text-align: left;
		border-bottom: 1px solid var(--medium-gray);
	}

	th {
		background-color: var(--light-gray);
		font-weight: 600;
		color: var(--light-gray);
		text-transform: uppercase;
		font-size: 0.85em;
		letter-spacing: 0.5px;
	}

	tr:hover {
		background-color: rgba(66, 133, 244, 0.05);
	}

	.modal {
		padding: 30px;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #ddd;
		padding-bottom: 10px;
		margin-bottom: 15px;
	}

	.modal-title {
		font-size: 1.5em;
		font-weight: bold;
	}

	.close-btn {
		font-size: 1.5em;
		cursor: pointer;
		color: #f2f2f2;
	}

	.close-btn:hover {
		color: #333;
	}

	.results-section {
		margin-bottom: 20px;
	}

	.results-title {
		font-weight: bold;
		margin-bottom: 10px;
		color: white;
	}


	.results-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 10px;
	}

	.results-table th,
	.results-table td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: left;
	}

	.results-table th {
		background-color: #364153;
	}
<<<<<<< HEAD
=======


>>>>>>> a3ce17506991975e24893b0f00fc3cff0f731719
</style>
