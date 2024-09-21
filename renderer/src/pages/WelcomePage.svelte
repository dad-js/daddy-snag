<script>
	import { push } from "svelte-spa-router";
</script>

<div class="relative w-full h-full py-4 mx-auto flex flex-col justify-center items-center">
	<div class="space-y-2 text-center flex flex-col items-center">
		<h2 class="h2 font-serif">Daddy Snag</h2>
		<figure>
			<section class="img-bg" />
			<img class="w-full opacity-75" src="/assets/logo.svg" alt="Logo" />
		</figure>
	</div>
	<div class="relative grow p-8">
		<div class="flex flex-col gap-8">
			<div class="grow w-1/2 grid grid-cols-[auto_1fr] gap-8">
				<button
					on:click={() => push("/marketplace")}
					class="btn w-96 mx-0 px-0 py-4 flex items-center rounded-md border-2 border-white/40 grayscale
					hover:border-white/80 hover:cursor-pointer hover:grayscale-0"
				>
					<div class="w-full bg-black/75 p-2 flex justify-center">
						<span class="text-center">Marketplace</span>
					</div>
				</button>
				<button
					on:click={() => push("/stash")}
					class="btn w-96 mx-0 px-0 py-4 flex items-center rounded-md border-2 border-white/40 grayscale
					hover:border-white/80 hover:cursor-pointer hover:grayscale-0"
				>
					<div class="w-full bg-black/75 p-2 flex justify-center">
						<span class="text-center">Stash</span>
					</div>
				</button>
				<button
					on:click={() => push("/listed-items")}
					class="btn w-96 mx-0 px-0 py-4 flex items-center rounded-md border-2 border-white/40 grayscale
					hover:border-white/80 hover:cursor-pointer hover:grayscale-0"
				>
					<div class="w-full bg-black/75 p-2 flex justify-center">
						<span class="text-center">Listings</span>
					</div>
				</button>
				<button
					on:click={() => push("/purchase-history")}
					class="btn w-96 mx-0 px-0 py-4 flex items-center rounded-md border-2 border-white/40 grayscale
					hover:border-white/80 hover:cursor-pointer hover:grayscale-0"
				>
					<div class="w-full bg-black/75 p-2 flex justify-center">
						<span class="text-center">Purchase History</span>
					</div>
				</button>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure img,
	.img-bg {
		@apply w-24 h-24;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[35px] transition-all;
		animation:
			pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>
