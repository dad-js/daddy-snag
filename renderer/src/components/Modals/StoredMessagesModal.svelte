<script lang="ts">
	import { onMount, type SvelteComponent } from "svelte";

	// Stores
	import { getModalStore } from "@skeletonlabs/skeleton";
	import ipc from "@libs/ipc";
	import { chat, type CustomMessageString, type ItemPropertyMessage } from "@context";
	import { Icon, Trash } from "svelte-hero-icons";

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;
	const modalStore = getModalStore();

	let savedMessages = ipc.value(chat, "savedMessages");
	$: $savedMessages;

	let selectedMessageParts: CustomMessageString[] = [];

	function renderMessage(parts: CustomMessageString[]) {
		return parts
			.map((part) => {
				if (part.type === "text") {
					return part.value;
				} else if (part.type === "item") {
					return `[${(part.value as ItemPropertyMessage).name}]`;
				}
			})
			.join("");
	}

	const selectMessage = (message: CustomMessageString[]) => {
		selectedMessageParts = message;

		if ($modalStore[0].response) {
			$modalStore[0].response({
				selectedMessageParts,
			});
		}
		modalStore.close();
	};

	// Base Classes
	const cBase = "card p-4 w-modal shadow-xl space-y-4";
	const cHeader = "text-2xl font-bold";
	const cForm = "border border-surface-500 p-4 space-y-4 rounded-container-token";
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? "Stored Messages"}</header>

		<div class="modal-form {cForm}">
			<div class="w-full flex flex-col gap-1 overflow-y-auto max-h-96">
				{#each $savedMessages as message, index}
					<div class="flex flex-col gap-1 w-full">
						<button
							class="btn btn-sm flex justify-between"
							on:click|stopPropagation={() => selectMessage(message)}
						>
							{renderMessage(message)}

							<button
								class="btn btn-neutral"
								on:click|stopPropagation={() =>
									ipc.call(chat, "deleteMessage", index)}
							>
								<Icon src={Trash} outline class="h-5" />
							</button>
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button>
		</footer>
	</div>
{/if}
