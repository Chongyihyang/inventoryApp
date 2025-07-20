<script lang="ts">
	import type { PageServerData } from './$types';
	import SignInModal from './signInModal.svelte';
	import SignOutModal from './signOutModal.svelte';
	const DEBUG = false


	function debugPrint(x: string, y) {
		console.log(x + ": \n---------------------")
		console.log(y)
		console.log("--------END---------")
	}

	let { form, data }: { 
		form?: FormData; 
		data: PageServerData 
	} = $props()
	const {
		items,
		departmentList,
		currentdept,
	} = data
	let selecteddept = $state(currentdept)
    let selectedusers = $state([])

	if (DEBUG) {
		debugPrint("data.items", data.items)
		debugPrint("data.inventoryList", data.inventoryList)
		debugPrint("data.departmentList", data.departmentList)
	}

	function changeSelectedItem() {
        selectedusers = []
        items.forEach(row => {
            if (row.issuerdept == selecteddept) {
                selectedusers.push(row)
        }})
    }

	$effect(() => {
        if (!form) return;

        if (form.error) {
            switch (form.action) {
                case 'signout':
                    signOutModalOpen = true;
                    break;
                case 'signin':
                    signInModalOpen = true;
                    break;
            }
        } else if (form.success) {
            closeAllModals();
        }
    })

	function closeAllModals() {
		signOutModalOpen = false
		signInModalOpen = false
    }

    let signOutModalOpen = $state(false)
    let signInModalOpen = $state(false)
</script>

<SignOutModal bind:signOutModalOpen {data} {form}/>
<SignInModal bind:signInModalOpen {data} {form}/>

<div class="mx-auto w-fit">
	<button
		class="m-3"
		onmousedown="{() => {
		signOutModalOpen = true
	}}">Sign Classifieds Out / HOTO</button>

	<button 
		class="m-3"
		onmousedown="{() => {
		signInModalOpen = true
	}}">Sign Classfieds In </button>
</div>
<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Issuer</th>
			<th>Issuee</th>
			<th>
                <select name="" id="" onchange="{changeSelectedItem}" bind:value={selecteddept}>
                    {#each departmentList as dept}
                        <option value={dept.id}>{dept.departmentname}</option>
                    {/each}
                </select>				
			</th>
		</tr>
	</thead>
    <tbody>
        {#each data.items as row}
        <tr>
            <td><h2>{row.itemname}</h2></td>
			<td><h2>{row.issuer}</h2></td>
            <td><h2>{row.issuee}</h2></td>
			<td></td>
        </tr>
        {/each}
    </tbody>
</table>
