<script lang="ts">
	import Department from '$lib/department.svelte';
	import '../app.css';

	let { data, children } = $props();
	let { user, dept, departmentList } = data
	
</script>


{#if data.user}
<nav>
	<ul>
		<li><a href="/" class="text-[20px] font-extrabold">キ</a></li>
		<li><a href="/users">Users</a></li>
		<li><a href="/items">Items</a></li>
		<li><a href="/transactions">Transactions</a></li>
		<li><a href="/stocktake">Stocktake</a></li>
		<li>
			<Department {dept} {departmentList}/>
		</li>
		<li>
			<form method="post" action="/?/logout">
				<button class="signout m-0">Sign out</button>
			</form>
		</li>
		<li>
			<h1 class="ml-3">Logged in as {user?.username}</h1>
		</li>
	</ul>
</nav>
{/if}


{@render children()}
