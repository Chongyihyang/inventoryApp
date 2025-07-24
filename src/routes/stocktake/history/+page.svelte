<script lang="ts">
	import Viewmodal from "./viewmodal.svelte";


	// Props
	let { data } = $props<{
		data: {
        
		}
	}>();
	const { stocktake } = data;
	const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    let viewIsOpen = $state(false)
    let items = $state()


	// Effects
	$effect(() => {
        if (viewIsOpen) {
        }
	});

    function openModal(item: unknown) {
        items = item
        viewIsOpen = true
    }


</script>

<Viewmodal bind:viewIsOpen {items}/>

<div class="internal" id="main">
	<div class="mx-auto max-h-[50vh] w-[90%] overflow-y-auto mb-3">
		<table class="w-full">
			<thead>
				<tr>
					<th>Accounted by:</th>
					<th>Time</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each stocktake as row}
					<tr class="hover" id={row.id}>
						<td><h2>{row.name}</h2></td>
						<td><h2>{new Date(row.time).toLocaleString('en-sg', options)}</h2></td>
						<td><button onclick="{() => {
                            openModal(row.items)
                        }}">View</button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

