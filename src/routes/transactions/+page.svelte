<script lang="ts">
	import type { PageServerData } from './$types';
	const DEBUG = true

	function debugPrint(x: string, y) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}

	let { data }: { data: PageServerData } = $props();
	if (DEBUG) {
		debugPrint("data.items", data.items)
		debugPrint("data.inventoryList", data.inventoryList)
		debugPrint("data.departmentList", data.departmentList)
	}
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
		</tr>
	</thead>
    <tbody>
        {#each data.items as row}
        <tr>
            <td><h2>{row.itemname}</h2></td>
			<td><h2>{row.issuer}</h2></td>
            <td><h2>{row.issuee}</h2></td>
            <td><h2>{new Date(row.outtime).toLocaleString('en-sg', options)}</h2></td>
            <td><h2>{new Date(row.inttime).toLocaleString('en-sg', options)}</h2></td>
        </tr>
        {/each}
    </tbody>
</table>

