<script lang="ts">
	import { ui } from "@context";
	import ipc from "@libs/ipc";
	import { Icon, XMark, Square2Stack, Minus } from "svelte-hero-icons";
	import LaunchGameButton from "./LaunchGameButton.svelte";

	const uiStatus = ipc.value(ui, "status");
</script>

<div
	class="titlebar drag-window"
	style={$uiStatus === "ready" ? "left: 4rem; padding-right: 4.5rem;" : ""}
>
	<div class="flex-grow"></div>
	{#if $uiStatus === "ready"}
		<div class="shrink-0 h-6 text-xs mr-2" style="-webkit-app-region: no-drag;">
			<LaunchGameButton></LaunchGameButton>
		</div>
	{/if}
	<button
		type="button"
		class="btn w-10 p-2 h-10 rounded-none hover:variant-ghost-surface"
		style="-webkit-app-region: no-drag;"
		on:click={() => ipc.call(ui, "minimizeApp")}
	>
		<Icon src={Minus} class="w-10"></Icon>
	</button>
	<button
		type="button"
		class="btn w-10 p-2 h-10 rounded-none hover:variant-ghost-surface"
		style="-webkit-app-region: no-drag;"
		on:click={() => ipc.call(ui, "maximizeApp")}
	>
		<Icon src={Square2Stack} class="w-10"></Icon>
	</button>
	<button
		type="button"
		class="btn w-10 p-2 h-10 rounded-none hover:variant-ghost-error"
		style="-webkit-app-region: no-drag;"
		on:click={() => ipc.call(ui, "closeApp")}
	>
		<Icon src={XMark} class="w-10"></Icon>
	</button>
</div>

<style lang="postcss">
	.titlebar {
		@apply fixed h-16 w-full  top-0 z-10;
		@apply flex flex-row justify-end items-center;
		@apply backdrop-blur-md bg-surface-800 shadow-lg drop-shadow-md;
		@apply border-b border-b-gray-950;
	}
</style>
