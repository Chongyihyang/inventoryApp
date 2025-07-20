<script lang="ts">
	import '../app.css';

	let { data, children } = $props();
	
</script>


{#if data.user}
<nav>
	<ul>
		<li><a href="/" class="font-bold text-[24px]">キ</a></li>
		<li><a href="/users">Users</a></li>
		<li><a href="/items">Items</a></li>
		<li><a href="/transactions">Transactions</a></li>
		<li><a href="/stocktake">Stocktake</a></li>
		<li>
			<form method="post" action="/?/logout">
				<button class="signout">Sign out</button>
			</form>
		</li>
	</ul>
</nav>
{/if}


{@render children()}
