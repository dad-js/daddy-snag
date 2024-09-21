<script lang="ts" context="module">
	import type { Inventory, Item } from "@dad-js/dad.js";

	export interface ItemData {
		data: Item;
		slotOffsetX: number;
		slotOffsetY: number;
	}
</script>

<script lang="ts">
	import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
	import { getContext, onMount } from "svelte";
	import ContextMenu, { Item as IItem, Divider, Settings } from "svelte-contextmenu";
	import { marketplace } from "@context";
	import ipc from "@libs/ipc";

	import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton";
	const modalStore = getModalStore();

	let myMenu: ContextMenu;

	export let data: Item;

	const inventory = getContext("inventory") as {
		data: Inventory;
		width: number;
		height: number;
	};

	let element: HTMLElement;
	let isDragging = false;

	onMount(() => {
		const cleanup = draggable({
			element,
			getInitialDataForExternal: (e) => {
				return {
					"text/plain": data.data.name,
				};
			},
			getInitialData: (e) => {
				var rect = e.element.getBoundingClientRect();
				const offsetX = Math.floor(
					((e.input.pageX - rect.x) / rect.width) * data.data.inventoryWidth,
				);
				const offsetY = Math.floor(
					((e.input.pageY - rect.y) / rect.height) * data.data.inventoryHeight,
				);

				return {
					data,
					slotOffsetX: offsetX,
					slotOffsetY: offsetY,
				} satisfies ItemData;
			},
			onDragStart: () => {
				isDragging = true;
			},
			onDrop: () => (isDragging = false),
		});
		return cleanup;
	});

	const sellItem = () => {
		const modal: ModalSettings = {
			type: "prompt",
			// Data
			title: `Sell ${data.data.name}?`,
			body: `Enter Price for\n> ${data.data.name} <`,
			// Populates the input value and attribustes
			value: 1,
			valueAttr: { type: "number", min: 1, max: 50000, required: true },
			// Returns the updated response value
			response: (r: number) => ipc.call(marketplace, "sellItem", data, r),
		};
		modalStore.trigger(modal);
	};
</script>

<ContextMenu bind:this={myMenu}>
	<IItem on:click={sellItem}>Sell</IItem>
</ContextMenu>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="item pointer-events-auto"
	class:isDragging
	bind:this={element}
	on:contextmenu={(e) => {
		console.log("Activating context menu");
		myMenu.show(e);
	}}
	style:grid-column={`${(data.slot % inventory.width) + 1} / span ${data.data.inventoryWidth}`}
	style:grid-row={`${Math.floor(data.slot / inventory.width + 1)} / span ${data.data.inventoryHeight}`}
	style:background-image={`url(assets/items/${data.data.imageName}.png)`}
	style:background-position={"center"}
	style:background-size={"75%"}
	style:background-repeat={"no-repeat"}
></div>

<style lang="postcss">
	.item {
		@apply bg-surface-800 border-primary-500 box-border border-2;
		@apply w-full h-full;
	}

	.isDragging {
		display: none;
	}

	:root {
		--ctx-menu-background: #1b1313;
		--ctx-menu-border: 1px solid #1f1b1b;
		--ctx-menu-border-radius: 0.5rem;
		--ctx-menu-hover-bg: #251a1a;
		--ctx-menu-font-size: 0.9rem;
		--ctx-menu-padding: 0.375rem 0.5rem;
		--ctx-menu-item-padding: 0.5rem 1rem;
	}
</style>
