<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'

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
    let departmentsList:Map<string, string> = new Map()  
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

<button onclick="{() => {
        addIsOpen = !addIsOpen
    }}"
    class="m-3 ml-[70%]"
>+ Add New Item</button>



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
                <button onclick="{() => {openEditModal(row)}}">✏️</button>
            </td>
            <td class="p-0">
                <button  onclick="{() => {openDeleteModal(row)}}">❌</button>
            </td>
        </tr>
        {/each}
    </tbody>
</table>
