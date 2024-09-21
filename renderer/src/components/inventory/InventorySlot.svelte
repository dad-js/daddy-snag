<script lang="ts" context="module">
	export interface SlotData {
		inventoryId: number;
		x: number;
		y: number;
		slot: number;
		isDraggedOver: boolean;
	}
</script>

<script lang="ts">
	import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
	import { onMount } from "svelte";

	export let data: SlotData;

	let element: HTMLElement;

	onMount(() => {
		return dropTargetForElements({
			element,
			getData: () => data as any,
			/* onDragEnter: () => (isDraggedOver = true),
			onDragLeave: () => (isDraggedOver = false),
			onDrop: () => (isDraggedOver = false), */
		});
	});
</script>

<div class="slot" bind:this={element} class:isDraggedOver={data.isDraggedOver}></div>

<style lang="postcss">
	.slot {
		@apply box-border border-2 border-surface-500;
		@apply w-full h-full;
	}

	.isDraggedOver {
		@apply bg-surface-500 border-transparent;
	}
</style>
