<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
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
        };
        form?: FormData;
    }>();
    
    
    // State
    let currentSelectedList = $state<Item | Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    let importIsOpen = $state(false)
    let departmentsList:Map<string, string> = new Map()  
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
    console.log(importResults.successfulItems[1].itemid)
    let fileOpener: HTMLInputElement
    const { departments, items, currentdept } = data
    
    departments.forEach((x: Department) => {
        departmentsList.set(x.departmentname, x.id)
    });
    
    let selecteddept = $state(currentdept)
    let selecteditems: Item[] = $state([]);
    
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
        if (importResults) {
            console.log("Results updated:", importResults);
        }

        if (!form) return;
        
        if (form.error) {
            switch (form.action) {
                case 'edit':
                    editIsOpen = true;
                    currentSelectedList = form.updateData;
                    break;
                case 'add':
                    addIsOpen = true;
                    $inspect(form?.error)
                    break;
                case 'delete':
                    deleteIsOpen = true;
                    currentSelectedList = {};
                    break;
            }
        } else if (form.success) {
            closeAllModals();
        }

        if (fileOpener.value != null) {
            console.log(fileOpener.value)
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
    
    function validateAndImport(content: string) {
        console.log(content)
        const rows = content.split(/\r?\n/).filter(row => row.trim() !== '');
        const results = {
            totalItems: 0,
            successCount: 0,
            errorCount: 0,
            successfulItems: [],
            failedItems: [],
            details: []
        };
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        let itemIdsList = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 1;
            const columns = row.split(',');
            if (i === 0) continue; // Skip header
            results.totalItems++;
            let isValid = true;
            let messages = [];

            // check itemId
            const itemid = columns[0] ? columns[0].trim() : '';
            if (!itemid) {
                isValid = false;
                messages.push("Missing item ID");
            } else if (!alphanumericRegex.test(itemid)) {
                isValid = false;
                messages.push("Item ID contains invalid characters");
            }

            const SN1 = columns[1] ? columns[1].trim() : '';

            //check SN2
            const SN2 = columns[2] ? columns[2].trim() : '';
             if (!/^[0-9]*$/.test(SN2)) {
                isValid = false;
                messages.push("SN2 contains characters other than numerals");
            }

            const remarks = columns[3] ? columns[3].trim() : '';

            const itemResult = {
                row: rowNumber,
                itemid,
                status: isValid ? "Success" : "Failed",
                SN1,
                SN2,
                remarks,
                messages: messages.join(", ")
            };
            if (isValid) {
                results.successCount++;
                results.successfulItems.push(itemResult);
                itemIdsList.push(itemid);
            } else {
                results.errorCount++;
                results.failedItems.push(itemResult);
            }
            results.details.push(itemResult);
        }
        return results;
    }
    
        
</script>

<AddItemModal bind:addIsOpen {form} {departments}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList}/>
<EditItemModal bind:editIsOpen {currentSelectedList} {form}/>
<ImportItemModal bind:importIsOpen {form} {importResults}/>

<div class="flex w-fit ml-[50%]">
    <button onmousedown="{() => {
    addIsOpen = !addIsOpen
    }}" class="m-3"
    >+ Add New Item</button>
        
    <button class="m-3"
    onmousedown="{() => {
        fileOpener.click()
    }}">+ Import From File
    <input type="file" class="hidden" 
    bind:this={fileOpener} name="file"
    onchange="{() => {
        if (!fileOpener.files[0]) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = (e.target as FileReader).result?.toString()?? ""
            importResults = validateAndImport(content)
            importIsOpen = true
        };
        reader.readAsText(fileOpener.files[0]);
        fileOpener.value = '';        
    }}"></button>
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
                <button onmousedown="{() => {openEditModal(row)}}">✏️</button>
            </td>
            <td class="p-0">
                <button  onmousedown="{() => {openDeleteModal(row)}}">❌</button>
            </td>
        </tr>
        {/each}
    </tbody>
</table>
