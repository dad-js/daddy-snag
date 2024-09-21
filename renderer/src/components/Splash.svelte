<script lang="ts">
	import ipc from "@libs/ipc";
	import AnimatedLogo from "./AnimatedLogo.svelte";
	import { ui } from "@context";
	import { onMount } from "svelte";
	import Titlebar from "./Titlebar.svelte";

	const status = ipc.value(ui, "status");
	const statusText = ipc.value(ui, "statusText");

	let statusLog = [] as string[];
	$: {
		if ($statusText !== statusLog[0]) {
			statusLog = [$statusText, ...statusLog.slice(0, 3)];
		}
	}

	/*
	let dots = "...";
	$: statusText = $_statusText.endsWith("...") ? $_statusText.slice(0, -3) + dots : $_statusText;
	onMount(() => {
		setInterval(() => {
			dots += ".";
			if (dots === "....") dots = "";
		}, 2000);
	});
    */
</script>

<div class="container h-full mx-auto flex justify-center items-center select-none">
	<div class="relative space-y-3 text-center flex flex-col items-center">
		<AnimatedLogo />
		<div class="absolute top-[100%] w-screen space-y-2 text-center flex flex-col items-center">
			<h3 class="h3 uppercase">{$statusText}</h3>
			{#if $status === "gameAlreadyRunning"}
				<span>Please close Dark and Darker to continue</span>
			{:else}
				{#each statusLog as msg, i}
					{#if i > 0}
						<span
							class="uppercase"
							style={`opacity: ${0.4 - 0.1 * i}; font-size: ${14 - 1 * i}px`}
							>{msg}</span
						>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</div>
<Titlebar></Titlebar>
