<figure>
	<section class="img-bg" />
	<img class="fill-token -scale-x-[100%]" src="assets/logo.svg" alt="Logo" />
</figure>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure img,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation:
			pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite,
			glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-transparent;
		}
		50% {
			@apply bg-primary-400/50;
		}
		80% {
			@apply bg-tertiary-400/30;
		}
		100% {
			@apply bg-transparent;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.3);
		}
	}
</style>
