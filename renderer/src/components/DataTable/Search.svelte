<script lang="ts">
	import type { DataHandler } from "@vincjo/datatables";
	export let handler: DataHandler;
	let value: string;
</script>

<input
	class="input sm:w-64 w-36 p-2"
	type="search"
	placeholder="Search..."
	bind:value
	on:input={() => handler.search(value)}
/>
