<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import BarcodeModal from './barcodeModal.svelte';
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'
	import ImportItemModal from './importItemModal.svelte';
    import { department } from "$lib/shared.svelte"
    import type { Categories, Item } from '$lib/server/db/schema'
    import type { User } from '$lib/utils';
    
    // Types

    type Results = {
            totalItems: number,
            successCount: number,
            errorCount: number,
            successfulItems: Array<Object>,
                failedItems: Array<string>,
                    details: Array<string>
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
    
    
    //Props
    let { data, form } = $props<{
        data: {
            user: User,
            departments: Department[],
            items: Item[],
            currentdept: number | null,
            currentrole: string | null,
            categories: Categories[],
        },
        form?: FormData,
    }>();
    const { user, departments, items, currentdept, currentrole, categories } = data
    
    
    // State
    let isUploading = $state(false);
    let fileInput: HTMLFormElement;
    let currentSelectedList = $state<Item | Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    let importIsOpen = $state(false)
    let barcodeIsOpen = $state(false)
    let selecteddept = $derived(department.current.value)
    let selecteditems: Item[] = $derived(changeSelectedItem2(items, selecteddept));
    let importResults = $state<Results>({
        totalItems: 0,
        successCount: 0,
        errorCount: 0,
        successfulItems: [{
            itemid: 0
        },{
            itemid:1
        },{
            itemid:2
        },{
            itemid:3
        },{
            itemid:4
        }],
        failedItems: [],
        details: []
    })

    function changeSelectedItem2(items_: Item[], selecteddept_: number) {
        let selecteditems_: Item[] = []
        items_.forEach((row: Item) => {
            if (row.currentholder == selecteddept_) {
                selecteditems_.push(row)
            }})
        return selecteditems_
    }
    
        
    // Handle form state changes
    $effect(() => {

        if (!form) return;
        
        if (form.error) {
            switch (form.action) {
                case 'edit':
                    editIsOpen = true;
                    currentSelectedList = form.updateData;
                    break;
                case 'add':
                    addIsOpen = true;
                    break;
                case 'delete':
                    deleteIsOpen = true;
                    currentSelectedList = {};
                    break;
            }
        } else if (form.results){
            importIsOpen = true
            importResults = form.results
            form.results = false
        } else if (form.success) {
            closeAllModals();
        }

    });
    
    function closeAllModals() {
        addIsOpen = false;
        editIsOpen = false;
        deleteIsOpen = false;
    }
    
    function openEditModal(item: Item) {
        currentSelectedList = item;
        editIsOpen = true;
    }
    
    function openDeleteModal(item: Item) {
        currentSelectedList = item;
        deleteIsOpen = true;
    }

    
        
</script>

<AddItemModal bind:addIsOpen {form} {departments} {user} {categories}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList} {user}/>
<EditItemModal bind:editIsOpen {currentSelectedList} {form} {user} {categories}/>
<ImportItemModal bind:importIsOpen {form} {importResults}/>
<BarcodeModal bind:barcodeIsOpen {selecteditems}/>

<div class="mx-auto max-h-[80vh] w-[90%] mt-3">
    <div class="flex max-sm:block">
        <button onmousedown="{() => {
            barcodeIsOpen = true
        }}" class="mb-3 max-sm:w-full" 
        >Print Barcodes</button>
    
        <button onmousedown="{() => {
        addIsOpen = !addIsOpen
        }}" class="mb-3 max-sm:w-full"
        >+ Add New Item</button>
            
        <form 
        method="POST" 
        action="?/upload" 
        enctype="multipart/form-data"
        bind:this={fileInput}
        onsubmit={() => isUploading = true}>
        <button type="button" class="mb-3 max-sm:w-full">
			<input type="hidden" name="id_" value={user.id}>
			<input type="hidden" name="username" value={user.username}>
            <input
              type="file"
              name="file"
              onchange={() => {
                // Auto-submit when file changes
                if (isUploading) return;
                fileInput.submit()
                isUploading = false
              }}
              class="hidden"
              id="file-upload"
              required
              disabled={isUploading}
            />
            <label for="file-upload" class="upload-button">
              {#if isUploading}
                Uploading...
              {:else}
              + Import New Items
              {/if}
            </label>
        </button>
        
      </form>
    </div>
    
    <div class="overflow-y-auto max-h-[70vh] mb-3 max-sm:w-full">
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>SN1</th>
                <th>SN2</th>
                <th>Original Holder</th>
                <th colspan="2">
                </th>
            </tr>
        </thead>
        <tbody>
            {#each selecteditems as row}
            {#if row.us}
                <tr class="hover text-red-600">
                    <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.itemname}</h2></td>
                    <td><h2>{row.SN1}</h2></td>
                    <td><h2>{row.SN2}</h2></td>
                    <td><h2>{row.originalholder}</h2></td>
                    <td class="p-0">
                        {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                            <button onmousedown="{() => {openEditModal(row)}}">✏️</button>
                        {/if}
                    </td>
                    <td class="p-0">
                        {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                            <button  onmousedown="{() => {openDeleteModal(row)}}">❌</button>
                        {/if}
                    </td>
                </tr>
            {:else}
                <tr class="hover">
                    <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.itemname}</h2></td>
                    <td><h2>{row.SN1}</h2></td>
                    <td><h2>{row.SN2}</h2></td>
                    <td><h2>{row.originalholder}</h2></td>
                    <td class="p-0">
                        {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                            <button onmousedown="{() => {openEditModal(row)}}">✏️</button>
                        {/if}
                    </td>
                    <td class="p-0">
                        {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept)}
                            <button  onmousedown="{() => {openDeleteModal(row)}}">❌</button>
                        {/if}
                    </td>
                </tr>
            {/if}
            {/each}
        </tbody>
    </table>
    </div>
</div>