<script lang="ts">
	import { SlideToggle, type ModalComponent } from "@skeletonlabs/skeleton";
	import { getModalStore } from "@skeletonlabs/skeleton";
	const modalStore = getModalStore();
	import { marketplace } from "@context";
	import ipc from "@libs/ipc";

	import AutoBuyFilters from "@components/AutoBuyFilters.svelte";
	import type { MarketplaceResponse } from "@dad-js/dad.js";
	type MarketplaceItem = MarketplaceResponse["items"];

	import { ChevronDown, Icon, Trash } from "svelte-hero-icons";

	let isAutoBuy: boolean = false;
	let autoBuy = ipc.value(marketplace, "autoBuy");
	$: {
		if (isAutoBuy != $autoBuy) {
			ipc.call(marketplace, "toggleAutoBuy", isAutoBuy);
		}
	}
	$: {
		if ($autoBuy != isAutoBuy) {
			isAutoBuy = $autoBuy;
		}
	}
	const toggleAutoBuy = () => {
		ipc.call(marketplace, "toggleAutoBuy", !isAutoBuy);
	};

	let isLogToFile: boolean = false;
	let logToFile = ipc.value(marketplace, "logToFile");
	$: {
		if (isLogToFile != $logToFile) {
			ipc.call(marketplace, "toggleLogToFile", isLogToFile);
		}
	}
	$: {
		if ($logToFile != isLogToFile) {
			isLogToFile = $logToFile;
		}
	}
	const toggleLogToFile = () => {
		ipc.call(marketplace, "toggleLogToFile", !isLogToFile);
	};

	$: {
		localStorage.setItem("marketplaceSettings", JSON.stringify({ logToContainer }));
	}

	let logToContainer: boolean =
		JSON.parse(localStorage.getItem("marketplaceSettings") ?? "{}")["logToContainer"] ?? false;
	let marketplaceItemList: MarketplaceItem = [];
	const marketplaceItems = ipc.value(marketplace, "marketplaceItems");
	$: {
		if (logToContainer) {
			const lastItemList = $marketplaceItems;
			lastItemList.items?.forEach((item) => {
				if (!marketplaceItemList.some((x) => x.listingId === item.listingId)) {
					marketplaceItemList.push(item);
				}
			});

			const cleanUp = () => {
				if (marketplaceItemList.length > 100) {
					marketplaceItemList.shift();
					cleanUp();
				}
			};
			cleanUp();

			marketplaceItemList = marketplaceItemList;
		}
	}

	const autoBuyFiltersModalComponent: ModalComponent = { ref: AutoBuyFilters };

	const showAutoBuyFilters = () => {
		modalStore.trigger({
			type: "component",
			component: autoBuyFiltersModalComponent,
		});
	};

	let shouldScroll: Boolean = true;
	const scrollToBottom = (node: HTMLElement, updt: any) => {
		const scroll = () => {
			if (shouldScroll) {
				node.scroll({
					top: node.scrollHeight,
					behavior: "instant",
				});
			}
		};
		scroll();

		return { update: scroll };
	};

	const clearContainer = () => {
		marketplaceItemList = [];
	};
</script>

<div class="relative h-full px-2 py-4 select-none space-y-2 w-full overflow-hidden">
	<div class="flex flex-row justify-end space-x-4 px-4">
		<div class="flex flex-row gap-2">
			<span class="">Monitor</span>
			<SlideToggle
				name="enable-logtofile"
				bind:checked={logToContainer}
				active="bg-gray-800"
				size="sm"
			></SlideToggle>
		</div>

		<div class="flex flex-row gap-2">
			<span class="">Auto-Buy</span>
			<SlideToggle
				name="enable-autoBuy"
				bind:checked={isAutoBuy}
				on:click={toggleAutoBuy}
				active="bg-secondary-500"
				size="sm"
			></SlideToggle>
		</div>
		<button
			on:click={clearContainer}
			type="button"
			aria-label="Clear Container"
			class="btn btn-sm variant-ghost-surface text-xs"
		>
			<Icon src={Trash} class="h-4"></Icon>
		</button>
		<button
			on:click={showAutoBuyFilters}
			type="button"
			aria-label="Manage AutoBuy Filter"
			class="btn btn-sm variant-ghost-tertiary text-xs">Manage Filter</button
		>
	</div>

	<div
		class="sticky flex flex-row items-center justify-between px-2 bg-surface-700 drop-shadow shadow-md rounded-t-md"
	>
		<div class=" flex flex-row items-center space-x-2">
			<div class="shrink-1">
				<span class="px-4">Icon</span>
			</div>
			<div class="flex flex-col">
				<span class="text-lg font-bold">Item Name</span>
			</div>
		</div>
		<div class="flex flex-row items-center space-x-2">
			<span class="text-lg font-bold">Price</span>
			<button class="btn btn-primary">Action</button>
		</div>
	</div>

	<div
		use:scrollToBottom={marketplaceItemList}
		on:wheel={() => {
			shouldScroll = false;
		}}
		class=" h-[88%] overflow-y-auto relative flex flex-col"
	>
		{#if !logToContainer}
			<div class="flex flex-col items-center mt-8">
				<span class="text-lg font-semibold">- Monitoring not enabled -</span>
			</div>
		{:else if marketplaceItemList.length == 0}
			<div class="flex flex-col items-center mt-8">
				<span class="text-lg font-semibold">- No Items to display -</span>
			</div>
		{:else}
			{#each marketplaceItemList as item}
				<div
					class="flex flex-row items-center justify-between p-2 border-b border-b-gray-400/50"
				>
					<div class="flex flex-row items-center space-x-2">
						<div class="shrink-1">
							<img
								alt="test"
								class="h-16 w-16 object-contain"
								src="assets/items/{item.item.data.imageName}.png"
							/>
						</div>
						<div class="flex flex-col">
							<span class="text-lg font-bold">{item.item.data.name}</span>
							<span class="text-xs">{item.nickname?.originalNickName}</span>
						</div>
					</div>
					<div class="flex flex-row items-center space-x-2">
						<span class="text-lg font-bold">{item.price}</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
	<button
		class="absolute z-10 bottom-2 left-[50%] btn rounded-full hover:variant-ghost p-3"
		style="transform: translateX(-50%)"
		on:click={() => {
			shouldScroll = true;
		}}
		class:hidden={shouldScroll}
	>
		<Icon src={ChevronDown} class="w-7"></Icon>
	</button>
</div>

<style lang="postcss">
</style>
