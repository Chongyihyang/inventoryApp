<script lang="ts">
	import AddItemModal from './addItemModal.svelte'
	import DeleteItemModal from './deleteItemModal.svelte'
	import EditItemModal from './editItemModal.svelte'

    // Types
    type User = {
        id: string
        username: string
        rolename: string
        roleid: number
        departmentid: number
    };

    type Department = {
        id: string
        departmentname: string
    };

    type Roles = {
        id: string
        rolename: string
    }

    type FormData = {
        error?: string
        action?: 'edit' | 'add' | 'delete'
        success?: boolean
    };

    
    //Props
    let { data, form } = $props<{
        data: {
            departments: Department[];
            users: User[];
            currentdept: string | null;
            currentrole: string | null;
            roles: Roles[];
        };
        form?: FormData;
    }>();
    let departmentsList:Map<string, string> = new Map()  
    const { users, departments, currentdept, roles, currentrole } = data
    

    departments.forEach((x: Department) => {
        departmentsList.set(x.departmentname, x.id)
    });


    // State
    let currentSelectedList = $state<User| Object>({})
    let addIsOpen = $state(false)
    let deleteIsOpen = $state(false)
    let editIsOpen = $state(false)
    
    
    let selecteddept = $state(currentdept)
    let selectedusers: User[] = $state([]);
    
    function changeSelectedItem() {
        selectedusers = []
        users.forEach((row: User) => {
            if (row.departmentid == selecteddept) {
                selectedusers.push(row)
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

    function openEditModal(User: User) {
        currentSelectedList = User;
        editIsOpen = true;
    }

    function openDeleteModal(User: User) {
        currentSelectedList = User;
        deleteIsOpen = true;
    }


</script>

<AddItemModal bind:addIsOpen {form} {departments} {roles}/>
<DeleteItemModal bind:deleteIsOpen {form} {currentSelectedList} />
<EditItemModal bind:editIsOpen {currentSelectedList} {form} {roles} {departments} {users} {currentrole}/>

<button onmousedown="{() => {
        addIsOpen = !addIsOpen
    }}"
    class="m-3 ml-[70%]"
>+ Add New User</button>



<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Role</th>
            <th colspan="2">
                <select name="" id="" onchange="{changeSelectedItem}" bind:value={selecteddept}>
                    {#each departments as dept}
                        <option value={dept.id}>{dept.departmentname}</option>
                    {/each}
                </select>
            </th>
        </tr>
    </thead>
    <tbody>
        {#each selectedusers as row}
        <tr class="hover">
            <td><h2 class="font-medium text-gray-900 whitespace-nowrap dark:text-white">{row.username}</h2></td>
            <td><h2>{row.rolename}</h2></td>
            <td class="p-0">
                {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept &&  row.roleid >= 2)}
                    <button onmousedown="{() => {openEditModal(row)}}">✏️</button>
                {/if}
            </td>
            <td class="p-0">
                {#if (currentrole == "1") || (currentrole == "2" && currentdept == selecteddept && row.roleid >= 2)}
                    <button  onmousedown="{() => {openDeleteModal(row)}}">❌</button>
                {/if}
            </td>
        </tr>
        {/each}
    </tbody>
</table>
