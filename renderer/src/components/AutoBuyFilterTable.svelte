<script lang="ts">
	import Search from "@components/DataTable/Search.svelte";
	import ThSort from "@components/DataTable/ThSort.svelte";
	import RowCount from "@components/DataTable/RowCount.svelte";
	import RowsPerPage from "@components/DataTable/RowsPerPage.svelte";
	import Pagination from "@components/DataTable/Pagination.svelte";

	import { DataHandler } from "@vincjo/datatables";

	import { marketplace } from "@context";
	import ipc from "@libs/ipc";
	import { MARKETPLACE_FILTER, type SMARKETPLACE_FILTER_INFO } from "@dad-js/dad-api/pb";
	import type { CombinedFilter } from "@shared/libs/MarketplaceFilter";
	import type { Unmessage } from "@dad-js/dad-api";
	import { Icon, Trash } from "svelte-hero-icons";

	const savedFilters = ipc.value(marketplace, "marketplaceFilters");

	let handler = new DataHandler($savedFilters, { rowsPerPage: 5 });
	let rows = handler.getRows();

	$: $savedFilters;
	$: {
		const newHandler = new DataHandler($savedFilters, { rowsPerPage: 5 });
		rows = newHandler.getRows();
		handler = newHandler;
	}

	function getFilterValue(filterEntry: CombinedFilter, key: MARKETPLACE_FILTER | string) {
		if (typeof key !== "string") {
			const filter = filterEntry.filter(
				(filter: Unmessage<SMARKETPLACE_FILTER_INFO>) => filter.filterType === key,
			)[0] as Unmessage<SMARKETPLACE_FILTER_INFO>;
			return filter?.filters[0] || "";
		}

		const filter = filterEntry.filter(
			(filter: Record<string, any>) => filter[key] !== undefined,
		)[0] as Record<string, any>;
		if (!filter) return "";

		return filter[key] || "";
	}

	const removeFilter = (filter: CombinedFilter) => {
		ipc.call(marketplace, "removeMarketplaceFilter", filter);
	};
</script>

<div class=" overflow-x-auto space-y-2">
	<header class="flex justify-between gap-4">
		<Search {handler} />
		<RowsPerPage {handler} />
	</header>
	<table class="table table-hover table-auto w-full">
		<thead>
			<tr>
				<ThSort {handler} orderBy="itemName">Item Name</ThSort>
				<td class="text-right font-bold px-2">Max Price</td>
				<td class="text-center font-bold px-2">Action</td>
			</tr>
		</thead>
		<tbody>
			{#each $rows as filterEntry}
				<tr>
					<td>{getFilterValue(filterEntry, "displayName")}</td>
					<td class="text-right">{getFilterValue(filterEntry, "maxPrice")}</td>
					<td class="text-center">
						<button class="cursor-pointer" on:click={() => removeFilter(filterEntry)}>
							<Icon src={Trash} outline class="h-5 text-red-500 "></Icon>
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<footer class="flex justify-between">
		<RowCount {handler} />
		<Pagination {handler} />
	</footer>
</div>
