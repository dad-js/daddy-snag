<script lang="ts">
	import { marketplace } from "@context";
	import ipc from "@libs/ipc";
	import { Icon, ArrowPath } from "svelte-hero-icons";

	const boughtItems = ipc.value(marketplace, "boughtItems");
	$: boughtItems;

	const reloadPurchaseHistory = () => ipc.call(marketplace, "reloadPurchaseHistory");
</script>

<div
	class="relative h-full max-h-[calc(100vh-1.5rem)] px-2 py-4 select-none w-full overflow-hidden"
>
	<div class="w-full flex justify-between px-6 -mt-1 pb-2 border-b border-b-slate-400/20">
		<span class="text-lg font-bold">Purchase History</span>
		<button class="btn-icon btn-icon-sm" on:click={reloadPurchaseHistory}>
			<Icon src={ArrowPath} class="text-white/50 w-6 h-6 "></Icon>
		</button>
	</div>

	<div
		class="sticky flex flex-row items-center justify-between px-2 bg-surface-700 drop-shadow shadow-md rounded-t-md"
	>
		<div class=" flex flex-row items-center space-x-4">
			<div class="shrink-1">
				<span class="px-4">Icon</span>
			</div>
			<div class="flex flex-col">
				<span class="text-lg font-bold">Item Name</span>
			</div>
		</div>
		<div class="flex flex-row items-center space-x-2 py-2 pr-16">
			<span class="text-lg font-bold">Price</span>
		</div>
	</div>

	<div class="h-[88%] overflow-y-auto">
		{#each $boughtItems as item}
			<div class="flex flex-row items-center gap-4 p-2 border-b">
				<div class="shrink-1">
					<img
						alt="test"
						class="h-16 w-16 object-contain"
						src="assets/items/{item.item.data.imageName}.png"
					/>
				</div>
				<div class="flex flex-col items-start space-x-2 grow">
					<span class="text-lg font-bold">{item.item.data.name}</span>
					<span class="text-xs">by {item.nickname?.originalNickName}</span>
				</div>
				<div class="flex flex-col space-x-2 px-4">
					<span class="text-lg font-bold">{item.price} Gold</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="postcss">
</style>
