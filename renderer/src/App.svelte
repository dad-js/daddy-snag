<script lang="ts">
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom";

	import {
		AppShell,
		AppRail,
		AppRailTile,
		initializeStores,
		Modal,
		storePopup,
		Toast,
		type ToastSettings,
		type PopupSettings,
		popup,
	} from "@skeletonlabs/skeleton";
	initializeStores();

	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	import Router, { location, push } from "svelte-spa-router";
	import {
		Icon,
		UserCircle,
		Cog8Tooth,
		ShoppingCart,
		CurrencyYen,
		Wallet,
		DevicePhoneMobile,
		ListBullet,
	} from "svelte-hero-icons";

	import { marketplace, ui, type ToastOption } from "@context";
	import ipc from "@libs/ipc";
	import Splash from "@components/Splash.svelte";
	import { onMount } from "svelte";
	import Titlebar from "@components/Titlebar.svelte";
	import SelectCharacter from "@components/SelectCharacter.svelte";

	import WelcomePage from "@pages/WelcomePage.svelte";
	import AutoBuy from "@pages/AutoBuy.svelte";
	import Marketplace from "@pages/Marketplace.svelte";
	import PurchaseHistory from "@pages/PurchaseHistory.svelte";
	import StashPage from "@pages/StashPage.svelte";
	import ListedItems from "@pages/ListedItems.svelte";

	const uiStatus = ipc.value(ui, "status");
	const uiStatusText = ipc.value(ui, "statusText");

	const routes = {
		"/": WelcomePage,
		"/marketplace": Marketplace,
		"/autobuy": AutoBuy,
		"/stash": StashPage,
		"/listed-items": ListedItems,
		"/purchase-history": PurchaseHistory,
	};

	const railTiles = [
		{ url: "/autobuy", icon: ShoppingCart, title: "AutoBuy" },
		{ url: "/stash", icon: DevicePhoneMobile, title: "Stash" },
		{ url: "/listed-items", icon: ListBullet, title: "My Listings" },
		{ url: "/purchase-history", icon: Wallet, title: "Purchase History" },
	];

	import { getToastStore } from "@skeletonlabs/skeleton";
	const toastStore = getToastStore();
	import cashAudio from "@assets/cash.mp3";

	let isAutoBuy: boolean = false;
	onMount(() => {
		window.bridge.send("ready");
		ipc.value(marketplace, "autoBuy").subscribe((val) => (isAutoBuy = val));
		ipc.value(ui, "toastMessage").subscribe(handleToastMessage);
	});

	const handleToastMessage = (val: ToastOption) => {
		if (val.message !== "") {
			const t: ToastSettings = {
				message: val.message,
				background: val.background ?? "bg-surface-500",
			};
			toastStore.trigger(t);
		}

		if (val.message.startsWith("Bought")) {
			const audio = new Audio(cashAudio);
			audio.volume = 0.75;
			audio.play();
		}

		toastStore.clear();
	};

	const popupAutoBuy: PopupSettings = {
		event: "hover",
		target: "popupAutoBuy",
		placement: "top",
	};

	const totalGold = ipc.value(marketplace, "totalGold");
	$: totalGold;

	const totalSpaceForGold = ipc.value(marketplace, "totalSpaceForGold");
	$: totalSpaceForGold;
</script>

{#if $uiStatus === "ready"}
	<Modal class="backdrop-blur-md" />
	<Toast position="br" />

	<AppShell slotSidebarLeft="">
		<svelte:fragment slot="header"></svelte:fragment>
		<svelte:fragment slot="sidebarLeft">
			<AppRail width=" w-16">
				<AppRailTile
					group={$location}
					name={"Home"}
					value={"/"}
					title={"Home"}
					on:click={() => push("/")}
				>
					<div class="w-full flex items-center justify-center">
						<img class="h-12" src="/assets/logo.svg" alt="Logo" />
					</div>
				</AppRailTile>
				{#each railTiles as tile}
					<AppRailTile
						group={$location}
						name={tile.title}
						value={tile.url}
						title={tile.title}
						on:click={() => push(tile.url)}
					>
						<Icon src={tile.icon} outline class="h-6"></Icon>
					</AppRailTile>
				{/each}
				<!-- --- -->
				<svelte:fragment slot="trail">
					<AppRailTile
						group={$location}
						name={"Character"}
						value={"/select-character"}
						title={"Character"}
						on:click={() =>
							ipc.call(ui, "setStatus", "selectCharacter", "Select Character")}
					>
						<Icon src={UserCircle} outline class="h-8"></Icon>
					</AppRailTile>
					<AppRailTile
						group={$location}
						name={"Settings"}
						value={"/settings"}
						title={"Settings"}
						on:click={() => push("/settings")}
					>
						<Icon src={Cog8Tooth} outline class="h-8"></Icon>
					</AppRailTile>
				</svelte:fragment>
			</AppRail>
		</svelte:fragment>
		<svelte:fragment slot="footer">
			<div
				class="bg-surface-900 border-t border-surface-700 w-full flex justify-between items-center h-8 p-0 px-3 text-sm"
			>
				<span class="text-center">{$uiStatusText}</span>

				<div class="flex flex-row space-x-2">
					<div class="flex flex-row">
						<div class="flex flex-row space-x-1">
							<p>
								Gold in Stash: {$totalGold.toLocaleString("en-US")} | Gold Space: {$totalSpaceForGold.toLocaleString(
									"en-US",
								)}
							</p>
						</div>
					</div>
					<div use:popup={popupAutoBuy} class="[&>*]:pointer-events-none">
						<Icon
							alt="AutoBuy"
							src={CurrencyYen}
							class="h-6 {isAutoBuy ? 'text-green-500' : 'text-red-500'}"
						></Icon>
					</div>
				</div>
				<div
					class="card p-2 {isAutoBuy ? 'variant-filled-success' : 'variant-filled-error'}"
					data-popup="popupAutoBuy"
				>
					<p>Auto Buy {isAutoBuy ? "Enabled" : "Disabled"}</p>
					<div
						class="arrow {isAutoBuy
							? 'variant-filled-success'
							: 'variant-filled-error'}"
					/>
				</div>
			</div>
		</svelte:fragment>

		<Titlebar></Titlebar>
		<div class="relative h-[calc(100vh-2rem)] w-full pt-16">
			<Router {routes} />
		</div>
	</AppShell>
{:else if $uiStatus === "selectCharacter"}
	<SelectCharacter></SelectCharacter>
{:else}
	<Splash></Splash>
{/if}
