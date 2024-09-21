<script lang="ts">
	import { onMount } from "svelte";
	import { marketplace } from "@context";
	import ipc from "@libs/ipc";
	import { Icon, ArrowPath } from "svelte-hero-icons";

	const listedItems = ipc.value(marketplace, "listedItems");
	$: $listedItems;

	const reloadMyListings = () => ipc.call(marketplace, "reloadMyListings");
	const collectItem = (listingId: bigint) => ipc.call(marketplace, "collectItem", listingId);

	const getItemState = (state: number) => {
		switch (state) {
			case 1:
				return "Listed";
			case 2:
				return "Expired";
			case 3:
				return "Sold";
			default:
				return "Unknown";
		}
	};

	onMount(() => {
		reloadMyListings();
	});
</script>

<div
	class="relative h-full max-h-[calc(100vh-1.5rem)] px-2 py-4 select-none w-full overflow-hidden"
>
	<div class="w-full flex justify-between px-6 -mt-1 pb-2 border-b border-b-slate-400/20">
		<span class="text-lg font-bold">Listed Items</span>
		<button class="btn-icon btn-icon-sm" on:click={reloadMyListings}>
			<Icon src={ArrowPath} class="text-white/50 w-6 h-6 "></Icon>
		</button>
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

	<div class="h-[88%] overflow-y-auto">
		{#if $listedItems.length === 0}
			<div class="flex flex-col items-center mt-8">
				<span class="text-lg font-semibold"
					>- You are not selling any items right now -</span
				>
			</div>
		{/if}
		{#each $listedItems as item}
			<div class="flex flex-row items-center gap-2 p-1 border-b">
				<div class="shrink-1">
					<img
						alt="test"
						class="h-16 w-16 object-contain"
						src="assets/items/{item.itemData.data.imageName}.png"
					/>
				</div>
				<div class="flex flex-col items-start space-x-2 grow">
					<span class="text-lg font-bold">{item.itemData.data.name}</span>
					<span class="text-xs">Status: {getItemState(item.state)}</span>
				</div>
				<div class="flex flex-col space-x-2 px-2">
					<span class="text-lg font-bold">{item.price} Gold</span>
				</div>
				<div class="flex flex-col space-x-2 px-2">
					{#if item.state === 3}
						<button
							class="btn btn-sm bg-secondary-500 rounded-md"
							on:click={() => collectItem(item.listingId)}
						>
							<span class="text-lg font-bold">Collect</span>
						</button>
					{:else if item.state === 1}
						<button
							class="btn btn-sm bg-red-500 rounded-md"
							on:click={reloadMyListings}
						>
							<span class="text-lg font-bold">Cancel</span>
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
</style>
