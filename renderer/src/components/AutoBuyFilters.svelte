<script lang="ts">
	import { TabGroup, Tab } from "@skeletonlabs/skeleton";
	import AutoBuyFilterTable from "./AutoBuyFilterTable.svelte";
	import AddAutoBuyFilter from "./AddAutoBuyFilter.svelte";

	let tabIndex: number = 0;
</script>

<div class="relative w-2/3 my-auto p-4 space-y-2 bg-surface-500">
	<TabGroup>
		<Tab bind:group={tabIndex} name="Filters" value={0}>Filters</Tab>
		<Tab bind:group={tabIndex} name="AddFilter" value={1}>New Filter</Tab>

		<svelte:fragment slot="panel">
			<hr class="!border-t-2 mb-2" />
			{#if tabIndex === 0}
				<div class="table-container">
					<AutoBuyFilterTable />
				</div>
			{:else if tabIndex === 1}
				<AddAutoBuyFilter />
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>

<style lang="postcss">
	:global(.tab-panel) {
		@apply border-none focus:border-none;
	}
	:global(
			.modal
				*:focus:not([tabindex="-1"]):not(.input):not(.textarea):not(.select):not(
					.input-group
				):not(.input-group input)
		) {
		outline-style: none;
	}
</style>
