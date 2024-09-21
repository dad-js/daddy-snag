<script lang="ts">
	import ipc from "@libs/ipc";
	import { game } from "@context";
	import { Icon, Play, Stop } from "svelte-hero-icons";

	const gameIsRunning = ipc.value(game, "isRunning");
	const startStopGame = () => {
		if ($gameIsRunning) {
			ipc.call(game, "kill");
		} else {
			ipc.call(game, "launch");
		}
	};
</script>

<div class="relative w-full h-full">
	<button
		type="button"
		class="w-full h-full btn btn-sm variant-filled-primary"
		on:click={startStopGame}
	>
		{#if $gameIsRunning}
			<Icon src={Stop} mini class="mr-2"></Icon> Stop game
		{:else}
			<Icon src={Play} mini class="mr-2"></Icon> Launch Game
		{/if}
	</button>
</div>
