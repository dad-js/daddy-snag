<script lang="ts">
	import ipc from "@libs/ipc";
	import Titlebar from "../components/Titlebar.svelte";
	import { dadclient, MAX_PACKET_HISTORY } from "@context";
	import { Accordion, AccordionItem, SlideToggle } from "@skeletonlabs/skeleton";
	import type { DirectionalPacket } from "@dad-js/dad.js";
	import JsonView from "@components/JsonView.svelte";

	import {
		Icon,
		ChevronDoubleLeft as PacketIn,
		ChevronDoubleRight as PacketOut,
		ChevronDown,
		BarsArrowDown,
		BarsArrowUp,
	} from "svelte-hero-icons";
	import { onMount } from "svelte";

	let element: HTMLElement;
	let fadeIn = false;
	let showScrollToBottom = false;
	let filter = localStorage.getItem("packetFilter") || "";

	let packetLog: [number, DirectionalPacket][] = [];
	let filteredPackets: [number, DirectionalPacket][] = [];

	let jsonLevel = 1;

	let packetId = 0;
	const lastPacket = ipc.value(dadclient, "lastPacket");
	//const packetLog = ipc.value(dadclient, "packetLog");
	$: {
		const packet = $lastPacket;
		if (packet) addPacket(packet);
	}

	function addPacket(packet: DirectionalPacket) {
		packetId = (packetId + 1) % Number.MAX_SAFE_INTEGER;
		//console.log(packetId);
		if (packetLog.length > MAX_PACKET_HISTORY) {
			packetLog.shift();
		}
		packetLog.push([packetId, packet]);
		packetLog = packetLog;
		if (element && isAtBottom(element)) {
			scrollToBottom(element);
		}
	}

	onMount(() => {
		const unsub = ipc.value(dadclient, "packetLog").subscribe((v) => {
			if (v.length) {
				v?.forEach((p) => addPacket(p));
				unsub();
			}
		});
	});

	function applyFilter() {
		const trimmedFilter = filter.trim();
		localStorage.setItem("packetFilter", filter);
		const rules = trimmedFilter
			.split(/\s+/i)
			.filter((r) => r)
			.map((r) => r.toLowerCase());

		filteredPackets = packetLog.filter(([id, packet]) => {
			const packetName = packet.name.toLowerCase();
			let allowPacket = rules.length === 0;
			for (const rule of rules) {
				if (rule.startsWith("-")) {
					if (rule.length > 1 && packetName.includes(rule.slice(1))) {
						return false;
					} else {
						allowPacket = true;
					}
				} else if (packetName.includes(rule)) {
					allowPacket = true;
				}
			}
			return allowPacket;
		});
	}

	function isAtBottom(element: HTMLElement) {
		return element.scrollHeight - element.offsetHeight - element.scrollTop < 40;
	}

	function scrollToBottom(element: HTMLElement) {
		applyFilter();
		setTimeout(() => element.scrollTo({ top: element.scrollHeight, behavior: "smooth" }), 200);
	}

	function selectText(element: Node) {
		const range = document.createRange();
		window.getSelection()?.removeAllRanges();
		range.selectNode(element);
		window.getSelection()?.addRange(range);
	}
</script>

<div
	class="relative h-full max-h-[calc(100vh-1.5rem)] pt-3 select-none w-full space-y-3 flex flex-col justify-center"
>
	<div class="px-5 flex flex-col gap-2 flex-shrink">
		<h1 class="text-2xl text-left text-white">Send / Received Packets</h1>

		<input
			class="input variant-form-transparent"
			type="text"
			placeholder="Filter"
			on:change={() => applyFilter()}
			bind:value={filter}
		/>
	</div>
	<div
		bind:this={element}
		on:scroll={() => {
			fadeIn = element.scrollTop > 10;
			showScrollToBottom = !isAtBottom(element);
		}}
		class="relative w-full flex-grow overflow-y-scroll flex flex-col items-end"
		class:fade-in={fadeIn}
	>
		<Accordion class="relative flex flex-col justify-end" autocollapse>
			{#each filteredPackets as [i, packet]}
				<AccordionItem id={"" + i}>
					<svelte:fragment slot="lead"
						><Icon
							src={packet.direction == "IN" ? PacketIn : PacketOut}
							outline
							class="h-5"
						></Icon></svelte:fragment
					>
					<svelte:fragment slot="summary">{packet.name}</svelte:fragment>
					<svelte:fragment slot="content">
						<!-- svelte-ignore a11y-no-static-element-interactions a11y-no-noninteractive-tabindex -->
						<div
							class="relative bg-slate-500/20 select-text space-y-2"
							on:click={(ev) => {
								ev.currentTarget.focus();
							}}
							on:keydown={(ev) => {
								if (ev.key === "a" && ev.ctrlKey) {
									ev.preventDefault();
									selectText(ev.currentTarget);
								}
							}}
							tabindex={i}
						>
							<div class="absolute top-2 right-2 flex flex-row">
								<button
									class="btn rounded-full hover:variant-ghost p-3"
									on:click={() => (jsonLevel = Infinity)}
								>
									<Icon src={BarsArrowDown} class="w-5 opacity-70"></Icon>
								</button>

								<button
									class="btn rounded-full hover:variant-ghost p-3"
									on:click={() => (jsonLevel = 1)}
								>
									<Icon src={BarsArrowUp} class="w-5 opacity-70"></Icon>
								</button>
							</div>
							<div class="max-h-80 py-2 pl-2 overflow-y-scroll">
								<JsonView json={packet.data} depth={jsonLevel}></JsonView>
							</div>
						</div>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	</div>
	<button
		class="absolute z-10 bottom-2 left-[50%] btn rounded-full hover:variant-ghost p-3"
		style="transform: translateX(-50%)"
		on:click={() => scrollToBottom(element)}
		class:hidden={!showScrollToBottom}
	>
		<Icon src={ChevronDown} class="w-7"></Icon>
	</button>
</div>

<style lang="postcss">
	.fade-in {
		-webkit-mask-image: linear-gradient(to top, black 80%, transparent 100%);
		mask-image: linear-gradient(to top, black 80%, transparent 100%);
		overflow-y: scroll;
	}
</style>
