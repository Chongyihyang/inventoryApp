<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import BarcodeModal from './barcodeModal.svelte';
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'
	import ImportItemModal from './importItemModal.svelte';
    
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
            departments: Department[];
            items: Item[];
            currentdept: string | null;
            currentrole: string | null
        };
        form?: FormData;
    }>();
    const { departments, items, currentdept, currentrole } = data
    
    
    // State
    let isUploading = $state(false);
    let fileInput: HTMLFormElement;
    let currentSelectedList = $state<Item | Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    let importIsOpen = $state(false)
    let barcodeIsOpen = $state(false)
    let departmentsList:Map<string, string> = new Map()  
    let selecteditems: Item[] = $state([]);
    let selecteddept = $state(currentdept)
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
    departments.forEach((x: Department) => {
        departmentsList.set(x.departmentname, x.id)
    });

    
    
    
    function changeSelectedItem() {
        selecteditems = []
        items.forEach((row: Item) => {
            if (String(row.currentholder) == departmentsList.get(selecteddept)) {
                selecteditems.push(row)
            }})
    }
        
    changeSelectedItem()
        
    // Handle form state changes
    $effect(() => {
        // if (importResults) {

        // }

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

<AddItemModal bind:addIsOpen {form} {departments}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList}/>
<EditItemModal bind:editIsOpen {currentSelectedList} {form}/>
<ImportItemModal bind:importIsOpen {form} {importResults}/>
<BarcodeModal bind:barcodeIsOpen {selecteditems}/>

<div class="flex w-fit ml-[30%]">
    <button class="m-3" onmousedown="{() => {
        barcodeIsOpen = true
    }}">Print Barcodes</button>

    <button onmousedown="{() => {
    addIsOpen = !addIsOpen
    }}" class="m-3"
    >+ Add New Item</button>
        
    <form 
    method="POST" 
    action="?/upload" 
    enctype="multipart/form-data"
    bind:this={fileInput}
    onsubmit={() => isUploading = true}>
    <button type="button" class="m-3">
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

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>SN1</th>
            <th>SN2</th>
            <th>Original Holder</th>
            <th colspan="2">
                <select name="" id="" onchange="{changeSelectedItem}" bind:value={selecteddept}>
                    {#each departments as dept}
                        {#if dept.departmentname == currentdept}
                            <option value={dept.departmentname} selected>{dept.departmentname}</option>
                        {:else}
                            <option value={dept.departmentname}>{dept.departmentname}</option>
                        {/if}
                    {/each}
                </select>
            </th>
        </tr>
    </thead>
    <tbody>
        {#each selecteditems as row}
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
        {/each}
    </tbody>
</table>
