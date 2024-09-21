<script lang="ts">
	import ipc from "@libs/ipc";
	import Titlebar from "./Titlebar.svelte";
	import { dadclient } from "@context";

	const characterList = ipc.value(dadclient, "characterList");
</script>

<div class="h-full w-full overflow-y-auto select-none flex justify-center">
	<div
		class="container m-auto py-20 px-10 flex flex-row flex-wrap w-full gap-5 justify-center content-center"
	>
		{#each $characterList as char}
			<button
				class="card bg-initial card-hover overflow-hidden flex flex-col h-max w-52 opacity-70 hover:opacity-100 rounded-xl"
				on:click={() => ipc.call(dadclient, "selectCharacter", char.id)}
			>
				<header
					class="card-header p-0 w-full h-40 class-img"
					style={`background-image: url(assets/classes/Portrait_${char.class}_HUD_${char.gender === 1 ? "Man" : "Woman"}.png`}
				></header>
				<section class="p-2 h-max flex justify-center flex-col items-center w-full">
					<span class="font-semibold">{char.name}</span>
					<span>Level {char.level}</span>
				</section>
			</button>
		{/each}
	</div>
</div>
<Titlebar></Titlebar>

<style lang="postcss">
	.class-img {
		@apply bg-no-repeat bg-center bg-cover;
	}
</style>
