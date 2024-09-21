<script lang="ts" context="module">
	import type { Inventory } from "@dad-js/dad.js";
	export interface InventoryData {
		data: Inventory;
		width: number;
		height: number;
	}
</script>

<script lang="ts">
	import Item, { type ItemData } from "./Item.svelte";
	import { onMount, setContext } from "svelte";
	import InventorySlot, { type SlotData } from "./InventorySlot.svelte";
	import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
	import ipc from "@libs/ipc";
	import { lobby } from "@context";
	import { clamp } from "@libs/utils";

	export let data: Inventory;
	export let width = 12;
	export let height = 20;

	let element: HTMLElement;
	let slots = [] as SlotData[][];

	$: items = data?.items ?? [];
	$: {
		setContext("inventory", { data, width, height } satisfies InventoryData);
	}
	$: {
		const _slots = [] as SlotData[][];
		for (let y = 0; y < height; y++) {
			_slots.push([]);
			for (let x = 0; x < width; x++) {
				_slots[y].push({
					inventoryId: data?.id ?? 0,
					x,
					y,
					slot: x + y * width,
					isDraggedOver: false,
				});
			}
		}
		slots = _slots;
	}

	function resetSlotPreview() {
		for (const row of slots) {
			for (const slot of row) {
				slot.isDraggedOver = false;
			}
		}
		slots = slots;
	}

	function showSlotPreview(hoveredSlot: SlotData, item: ItemData) {
		const collided = hasCollision(hoveredSlot, item);
		const dropSlot = getDropSlot(hoveredSlot, item);
		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				slots[y][x].isDraggedOver =
					!collided &&
					x >= dropSlot.x &&
					x < dropSlot.x + item.data.data.inventoryWidth &&
					y >= dropSlot.y &&
					y < dropSlot.y + item.data.data.inventoryHeight;
			}
		}
	}

	function getDropSlot(hoveredSlot: SlotData, item: ItemData) {
		return slots[
			clamp(hoveredSlot.y - item.slotOffsetY, 0, height - item.data.data.inventoryHeight)
		][clamp(hoveredSlot.x - item.slotOffsetX, 0, width - item.data.data.inventoryWidth)];
	}

	function hasCollision(hoveredSlot: SlotData, item: ItemData) {
		const dropSlot = getDropSlot(hoveredSlot, item);
		const slotX = dropSlot.x;
		const slotY = dropSlot.y;
		const slotW = item.data.data.inventoryWidth;
		const slotH = item.data.data.inventoryHeight;
		for (const i of items) {
			const itemX = i.slot % width;
			const itemY = Math.floor(i.slot / width);
			const itemW = i.data.inventoryWidth;
			const itemH = i.data.inventoryHeight;
			if (
				itemX < slotX + slotW &&
				itemX + itemW > slotX &&
				itemY < slotY + slotH &&
				itemY + itemH > slotY
			) {
				return i.uid !== item.data.uid;
			}
		}
		return false;
	}

	onMount(() => {
		return monitorForElements({
			onDrop({ source, location }) {
				resetSlotPreview();
				const destination = location.current.dropTargets[0];
				if (!destination || typeof destination.data.slot !== "number") {
					return;
				}
				const hoveredSlot = destination.data as any as SlotData;
				if (hoveredSlot.inventoryId !== data.id) return;

				const item = source.data as any as ItemData;
				if (hasCollision(hoveredSlot, item)) return;

				const toSlot = getDropSlot(hoveredSlot, item);
				return ipc.call(lobby, "moveItem", item.data, {
					inventory: data.id,
					slot: toSlot.slot,
				});
			},
			onDropTargetChange({ source, location }) {
				const target = location.current.dropTargets[0];
				if (target) {
					const hoveredSlot = target.data as unknown as SlotData;
					if (hoveredSlot.inventoryId === data.id) {
						const item = source.data as any as ItemData;
						showSlotPreview(hoveredSlot, item);
					} else {
						resetSlotPreview();
					}
				} else {
					resetSlotPreview();
				}
			},
		});
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="relative inventory"
	bind:this={element}
	style:grid-template-columns={`repeat(${width}, 1fr)`}
	style:grid-template-rows={`repeat(${height}, 1fr)`}
	style:aspect-ratio={`${width} / ${height}`}
>
	{#each slots as row}
		{#each row as slot}
			{#key slot.slot}
				<InventorySlot data={slot}></InventorySlot>
			{/key}
		{/each}
	{/each}
	<div
		class="absolute w-full h-full grid pointer-events-none"
		style:grid-template-columns={`repeat(${width}, 1fr)`}
		style:grid-template-rows={`repeat(${height}, 1fr)`}
		style:aspect-ratio={`${width} / ${height}`}
	>
		{#each items as item}
			{#key item.uid}
				<Item data={item}></Item>
			{/key}
		{/each}
	</div>
</div>

<style lang="postcss">
	.inventory {
		@apply relative bg-surface-700 box-border border-surface-400 border-2;
		@apply w-full grid;
	}
</style>
