<script lang="ts">
    import { department } from "$lib/shared.svelte"
    let { dept, departmentList } = $props<{
        dept: string | null,
        departmentList: unknown
    }>();
    let selecteddept = $state(Number(dept))

    function changeSelectedItem() {
        department.current.value = selecteddept
    }

    changeSelectedItem()

    $effect(() => {
    })

</script>


<select onchange="{changeSelectedItem}" bind:value={selecteddept} class="border-1 h-10 my-auto">
    {#each departmentList as department}
        <option value={department.id}>{department.departmentname}</option>
    {/each}
</select>
