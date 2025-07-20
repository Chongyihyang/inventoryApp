<script lang="ts">
	import type { PageServerData } from '../$types';
	const DEBUG = true
	type Transactions = {
		id: number,
		itemname: string | null,
		itemid: string | null,
		outtime: number | null,
		inttime: number | null,
		issuer: string | null,
		issuerid: string | null,
		issuerdept: number | null,
		issuee: string | null,
		issueeid: string | null
	}

	function debugPrint(x: string, y) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}

	let { data }: { data: PageServerData } = $props();
	let selecteddept = $state(data.currentdept)
	let selectedtransactions: Transactions[] = $state([])
	let dateInput: HTMLFormElement

	if (DEBUG) {
		debugPrint("data.items", data.items)
		debugPrint("data.departmentList", data.departmentList)
	}
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
	
    function changeSelectedItem() {
        selectedtransactions = []
        data.items.forEach((row: Transactions) => {
            if (row.issuerdept == selecteddept) {
                selectedtransactions.push(row)
        }})
    }
	changeSelectedItem()

</script>
<h1 class="title">Transactions</h1>
<table class="mt-10">
	<thead>
		<tr>
			<th>Name</th>
			<th>Issuer</th>
			<th>Issuee</th>
            <th>Out time</th>
            <th>In time</th>
			<th>
                <select name="" id="" onchange="{changeSelectedItem}" bind:value={selecteddept}>
                    {#each data.departmentList as dept}
                        <option value={dept.id}>{dept.departmentname}</option>
                    {/each}
                </select>
				<br><br>
				<form action="?/changedate" 
				method="POST"
				bind:this={dateInput}>
					<input type="date"
					onchange="{() => {
						dateInput.submit()
					}}" name="date">
				</form>
			</th>
		</tr>
	</thead>
    <tbody>
        {#each selectedtransactions as row}
        <tr>
            <td><h2>{row.itemname}</h2></td>
			<td><h2>{row.issuer}</h2></td>
            <td><h2>{row.issuee}</h2></td>
            <td><h2>{new Date(row.outtime).toLocaleString('en-sg', options)}</h2></td>
			{#if row.inttime == null}
				<td></td>
			{:else}
	            <td><h2>{new Date(row.inttime).toLocaleString('en-sg', options)}</h2></td>
			{/if}
			<td></td>
        </tr>
        {/each}
    </tbody>
</table>

