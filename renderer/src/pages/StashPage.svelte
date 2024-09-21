<script lang="ts">
	import Inventory from "@components/inventory/Inventory.svelte";

	import { lobby } from "@context";
	import ipc from "@libs/ipc";
	import {
		ArchiveBox,
		ArchiveBoxXMark,
		ChevronDoubleLeft,
		ChevronDoubleRight,
		Icon,
		Plus,
		Star,
	} from "svelte-hero-icons";

	const characterInventory = ipc.value(lobby, "inventory");
	const stash = ipc.value(lobby, "stash");

	let stashIndex: number = 0;

	$: stash1 = $stash[2]?.items ?? [];

	const itemSize = { width: 24, height: 24 };
	const ownInventorySize = { cols: 10, rows: 5 };
	const stashSize = { cols: 10, rows: 20 };
</script>

<div
	class="relative h-full max-h-[calc(100vh-1.5rem)] px-2 select-none w-full space-y-3 flex flex-col justify-center"
>
	<div class="p-4 w-full flex flex-row justify-between overflow-hidden">
		<!--
		<div class="shrink flex flex-col w-1/6 pr-4 space-y-2">
			<span class="font-bold text-left">Quick Actions</span>

			<div class="relative h-full flex flex-col gap-4">
				<button class="h-8 btn btn-sm variant-filled-surface justify-between">
					<small class="opacity-50">Move Inventory to Stash</small>
					<Icon src={Plus} outline class="w-5 h-5"></Icon>
				</button>
				<button class="h-8 btn btn-sm variant-filled-surface justify-between">
					<small class="opacity-50">Sort Inventory</small>
					<Icon src={Plus} outline class="w-5 h-5"></Icon>
				</button>
				<button class="h-8 btn btn-sm variant-filled-surface justify-between">
					<small class="opacity-50">Sort Stash</small>
					<Icon src={Plus} outline class="w-5 h-5"></Icon>
				</button>
			</div>
		</div>
		-->
		<div class="flex-1 gap-4 flex flex-row justify-between">
			<div class="flex flex-col items-center">
				<button class="btn btn-sm pointer-events-none cursor-default font-bold">
					Character Inventory
				</button>
				<div class="w-96">
					<Inventory data={$characterInventory} width={10} height={5} />
					<small class="text-secondary-500/50 pl-1">
						Right-Click and Item for more actions
					</small>
				</div>
			</div>

			<div class="overflow-auto">
				<div class="flex flex-row justify-between items-center w-96">
					<button on:click={() => stashIndex--} class="btn btn-sm ml-8">
						<Icon src={ChevronDoubleLeft} outline class="w-5 h-5"></Icon>
					</button>
					<span class="text-white font-bold text-center">Stash 1</span>
					<button on:click={() => stashIndex++} class="btn btn-sm">
						<Icon src={ChevronDoubleRight} outline class="w-5 h-5"></Icon>
					</button>
				</div>

				<div class="flex flex-row h-[95%]">
					<div class="relative h-full flex flex-col items-start">
						<button
							class="btn-icon btn-icon-sm border border-secondary-500/50 p-1 rounded-none"
						>
							<Icon src={ArchiveBox} outline class="w-6 h-6"></Icon>
						</button>
						<button
							class="btn-icon btn-icon-sm border border-surface-500/50 p-1 rounded-none"
						>
							<Icon src={ArchiveBox} outline class="w-6 h-6"></Icon>
						</button>
						<button
							class="btn-icon btn-icon-sm border border-primary-500 p-1 rounded-none"
						>
							<Icon src={ArchiveBoxXMark} outline class="w-6 h-6"></Icon>
						</button>
						<button
							class="btn-icon btn-icon-sm border border-primary-500 p-1 rounded-none"
						>
							<Icon src={ArchiveBoxXMark} outline class="w-6 h-6"></Icon>
						</button>
						<button
							class="btn-icon btn-icon-sm border border-primary-500 p-1 rounded-none"
						>
							<Icon src={ArchiveBoxXMark} outline class="w-6 h-6"></Icon>
						</button>
						<button
							class="btn-icon btn-icon-sm border border-surface-500 p-1 rounded-none"
						>
							<Icon src={Star} outline class="w-5 h-5"></Icon>
						</button>
					</div>
					<Inventory data={$stash[stashIndex]} />
				</div>
			</div>
		</div>
	</div>
</div>
