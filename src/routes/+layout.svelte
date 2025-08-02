<script lang="ts">
	import { page } from '$app/state'
	import '../app.css';

	let { data, children } = $props();
	let { user, dept, departmentList, role } = data
	let ignore = ["stocktake", "logs"]

    import { department } from "$lib/shared.svelte"
    let selecteddept = $state(Number(dept))

    function changeSelectedItem() {
        department.current.value = selecteddept
    }

    changeSelectedItem()
</script>


{#if data.user}
<script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script>
<nav data-sveltekit-preload-data>
	<div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
	  <div class="relative flex h-13 items-center justify-between">
		<div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
		  <!-- Mobile menu button-->
		  <button type="button" command="--toggle" commandfor="mobile-menu" class="relative inline-flex items-center justify-center  p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
			<span class="absolute -inset-0.5"></span>
			<span class="sr-only">Open main menu</span>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 in-aria-expanded:hidden">
			  <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" class="size-6 not-in-aria-expanded:hidden">
			  <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		  </button>
		</div>
		<div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
		  <div class="flex shrink-0 items-center">
			<a href="/" class=" px-2 py-4 text-sm font-extrabold max-sm:hidden hover:bg-gray-700 aria-current:bg-gray-700" aria-current={page.url.pathname === '/'} data-sveltekit-prefetch>キ</a>
		</div>
		<div class="hidden sm:ml-6 sm:block">
			<div class="flex space-x-4">
				<div class="dropdown">
					<div class="px-2 py-4 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700">
						Settings
					</div>
					<div class="dropdown-content">
						<a href="/users" class=" px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700" aria-current={page.url.pathname.includes('/users')} data-sveltekit-prefetch>Users</a>
						<a href="/items" class="px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700" aria-current={page.url.pathname.includes('/items')} data-sveltekit-prefetch>Items</a>
						<a href="/category" class="px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700" aria-current={page.url.pathname.includes('/category')} data-sveltekit-prefetch>Category</a>
					</div>
				</div>
				<div class="dropdown">
					<div class=" px-2 py-4 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700">
						Transactions
					</div>
					<div class="dropdown-content">
						<a href="/transactions" class=" px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700" aria-current={page.url.pathname.includes('/transactions')} data-sveltekit-prefetch>In Out</a>
						<a href="/stocktake" class=" px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700" aria-current={page.url.pathname.includes('/stocktake')} data-sveltekit-prefetch>Stocktake</a>
						{#if Number(role) == 1}
							<a href="/logs" class="px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:bg-gray-700" aria-current={page.url.pathname.includes('/logs')} data-sveltekit-prefetch>Logs</a>
						{/if}
					</div>
				</div>

			{#if ignore.filter(x => page.url.pathname.includes(x)).length == 0}
			<select onchange="{changeSelectedItem}" bind:value={selecteddept} class="border-1 h-10 my-auto">
				{#each departmentList as department}
					<option value={department.id}>{department.departmentname}</option>
				{/each}
			</select>
			{/if}
			</div>
		  </div>
		</div>
		<div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
			<h1 class="mr-3">Logged in as {user?.username}</h1>
			<form method="post" action="/?/logout">
				<button class="signout m-0">Sign out</button>
			</form>
		</div>
	  </div>
	</div>
  
	<el-disclosure id="mobile-menu" hidden class="block sm:hidden">
	  <div class="space-y-1 px-2 pt-2 pb-3">
		<!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
		<a href="/"  class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname === '/'}>Home</a>
		<a href="/users"  class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname.includes("/users")}>Users</a>
		<a href="/items" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname.includes("/items")}>Items</a>
		<a href="/category" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname.includes('/category')} data-sveltekit-prefetch>Category</a>
		<a href="/transactions" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname.includes("/transactions")}>Transactions</a>
		<a href="/stocktake" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname.includes("/stocktake")}>Stocktake</a>
		{#if Number(role) == 1}
			<a href="/logs" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white aria-current:underline" aria-current={page.url.pathname.includes("/logs")}>Logs</a>
		{/if}
		<select onchange="{changeSelectedItem}" bind:value={selecteddept} class="border-1 h-10 my-auto">
			{#each departmentList as department}
				<option value={department.id}>{department.departmentname}</option>
			{/each}
		</select>
	  </div>
	</el-disclosure>
  </nav>
{/if}


{@render children()}
