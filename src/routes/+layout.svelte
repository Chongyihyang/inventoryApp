<script lang="ts">
	import Department from '$lib/department.svelte';
	import '../app.css';

	let { data, children } = $props();
	let { user, dept, departmentList } = data
	
</script>


{#if data.user}
<script src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1" type="module"></script>
<nav class="bg-gray-800">
	<div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
	  <div class="relative flex h-16 items-center justify-between">
		<div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
		  <!-- Mobile menu button-->
		  <button type="button" command="--toggle" commandfor="mobile-menu" class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
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
			<a href="/" class="text-[20px] font-extrabold max-sm:hidden">キ</a>
		</div>
		<div class="hidden sm:ml-6 sm:block">
			<div class="flex space-x-4">
				<!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
			  <a href="/users" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Users</a>
			  <a href="/items" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Items</a>
			  <a href="/transactions" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Transactions</a>
			  <a href="/stocktake" class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Stocktake</a>
			  <Department {dept} {departmentList}/>
			</div>
		  </div>
		</div>
		<div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
			<!-- <Department {dept} {departmentList}/> -->
			<h1 class="mr-3 ml-3">Logged in as {user?.username}</h1>
			<form method="post" action="/?/logout">
				<button class="signout m-0">Sign out</button>
			</form>
		</div>
	  </div>
	</div>
  
	<el-disclosure id="mobile-menu" hidden class="block sm:hidden">
	  <div class="space-y-1 px-2 pt-2 pb-3">
		<!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
		<a href="/"  class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Home</a>
		<a href="/users"  class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Users</a>
		<a href="/items" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Items</a>
		<a href="/transactions" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Transactions</a>
		<a href="/stocktake" class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Stocktake</a>
		<Department {dept} {departmentList}/>
	  </div>
	</el-disclosure>
  </nav>
{/if}


{@render children()}
