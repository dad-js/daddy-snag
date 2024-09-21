<script lang="ts">
	import { onMount } from "svelte";
	import {
		Autocomplete,
		popup,
		type AutocompleteOption,
		type PopupSettings,
	} from "@skeletonlabs/skeleton";
	import { Icon, PlusCircle } from "svelte-hero-icons";
	import type { Placement } from "@floating-ui/dom";

	import ipc from "@libs/ipc";
	import { dadclient, marketplace } from "@context";
	import MarketplaceFilter from "@shared/libs/MarketplaceFilter";

	import {
		Define_Item_LootState,
		Define_Item_rarityType,
		MARKETPLACE_FILTER,
	} from "@dad-js/dad-api/pb";
	import type { IItemDBEntry } from "node_modules/@dad-js/dad-items/dist/types";

	let itemDB = ipc.value(dadclient, "itemDB");
	let listOfItems: IItemDBEntry[] = [];

	onMount(async () => {
		listOfItems = $itemDB.getItems();
	});

	// -> Default Settings
	let defaultPopupSettings: PopupSettings = {
		event: "focus-click",
		placement: "bottom-start",
		target: "",
	};

	const popupFilterItemNameSettings = { ...defaultPopupSettings, target: "popupFilterItemName" };

	let filterItemNameOptions: AutocompleteOption<string>[] = [];
	let filterRarityOptions: AutocompleteOption<string>[] = [];
	let filterLootStateOptions: AutocompleteOption<string>[] = [];
	let filterPrimaryProperties: AutocompleteOption<string>[] = [];
	let filterSecondaryProperties: AutocompleteOption<string>[] = [];

	// -> Autocomplete for Item Names
	let filterItemNameLabel: string = "";
	let selectedItem: IItemDBEntry;

	$: {
		filterItemNameOptions = listOfItems
			?.filter((item) => {
				if (selectedRarityValue !== "" && item.RarityType !== selectedRarityValue) {
					return false;
				}
				return item;
			})
			.map((item) => ({
				label: item.Name,
				value: item.Id,
				meta: item,
			}));

		filterRarityOptions = [];
		Object.keys(Define_Item_rarityType)
			.filter((v) => isNaN(Number(v)))
			.forEach((rarity) => {
				const checkRarity = (obj: AutocompleteOption<string>) => obj.value === rarity;
				if (filterRarityOptions.some(checkRarity) === false) {
					filterRarityOptions = [
						...filterRarityOptions,
						{
							label: rarity,
							value: rarity,
							keywords: "",
						},
					];
				}
			});

		filterLootStateOptions = [];
		Object.keys(Define_Item_LootState)
			.filter((v) => isNaN(Number(v)))
			.forEach((lootState) => {
				const checkLootState = (obj: AutocompleteOption<string>) => obj.value === lootState;
				if (filterLootStateOptions.some(checkLootState) === false) {
					filterLootStateOptions = [
						...filterLootStateOptions,
						{
							label: lootState,
							value: lootState,
							keywords: "",
						},
					];
				}
			});
	}
	const onItemNameSelected = (event: CustomEvent<AutocompleteOption<string>>): void => {
		filterItemNameLabel = event.detail.label;
		selectedItem = <IItemDBEntry>event.detail.meta;
	};

	// --> AutoComplete for Rarity
	const popupFilterRaritySettings = { ...defaultPopupSettings, target: "popupFilterRarity" };

	let filterRarityLabel: string = "";
	let selectedRarityValue: string = "";

	const onRaritySelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		filterRarityLabel = event.detail.label;
		selectedRarityValue = event.detail.value;
	};

	// --> AutoComplete for Loot State
	const popupFilterLootStateSettings = {
		...defaultPopupSettings,
		target: "popupFilterLootState",
	};

	let filterLootStateLabel: string = "";
	let selectedLootStateValue: string = "";

	const onLootStateSelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		filterLootStateLabel = event.detail.label;
		selectedLootStateValue = event.detail.value;
	};
	// -> Max Price
	let selectedMaxPriceValue: number;

	// -> Primary Properties
	let primaryPropertiesList: { property: string; value: number }[] = [];

	const popupFilterPrimaryProperties = {
		...defaultPopupSettings,
		target: "popupFilterPrimaryProperties",
		placement: "bottom-end" as Placement,
	};

	const onPrimaryPropertySelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		primaryPropertiesList = [
			...primaryPropertiesList,
			{ property: event.detail.label, value: 0 },
		];
	};

	// -> Secondary Properties
	let secondaryPropertiesList: { property: string; value: number }[] = [];

	const popupFilterSecondaryProperties = {
		...defaultPopupSettings,
		target: "popupFilterSecondaryProperties",
		placement: "bottom-end" as Placement,
	};

	const onSecondaryPropertySelection = (event: CustomEvent<AutocompleteOption<string>>): void => {
		secondaryPropertiesList = [
			...secondaryPropertiesList,
			{ property: event.detail.value, value: 0 },
		];
	};

	// -> Apply
	const onApplyNewFilter = () => {
		const marketplaceFilters: MarketplaceFilter = new MarketplaceFilter();

		// -> Item Name
		if (selectedItem) {
			marketplaceFilters.addFilter(MARKETPLACE_FILTER.NAME, [selectedItem.Id]);
			marketplaceFilters.addCustomFilter("displayName", selectedItem.Name);
		}

		// -> Rarity
		if (selectedRarityValue !== "") {
			marketplaceFilters.addFilter(MARKETPLACE_FILTER.RARITY, [selectedRarityValue]);
		}

		// -> Max Price
		if (selectedMaxPriceValue > 0) {
			marketplaceFilters.addCustomFilter("maxPrice", selectedMaxPriceValue.toString());
		}

		console.log(marketplaceFilters);
		ipc.call(marketplace, "addMarketplaceFilter", [
			...marketplaceFilters.getFilters(),
			marketplaceFilters.getCustomFilters(),
		]);
	};
</script>

<div class="relative h-96 min-h-96 p-2">
	<div class="h-full flex flex-row space-x-4 grow">
		<!-- Name, Price etc. -->
		<div
			class="w-2/3 grow h-full flex flex-col gap-4 border-r-2 border-r-gray-600/50 mt-1 pr-2"
		>
			<!-- Item Name -->
			<div class="flex flex-row justify-between space-y-1 shrink">
				<label for="filterItemName" class="text-lg">Item Name:</label>
				<div class="">
					<input
						class="input variant-form-transparent pl-3"
						type="search"
						name="filterItemName"
						bind:value={filterItemNameLabel}
						placeholder="Search..."
						use:popup={popupFilterItemNameSettings}
					/>
					<div
						data-popup="popupFilterItemName"
						class="max-h-48 p-4 overflow-y-auto bg-gray-600 rounded z-10"
						tabindex="-1"
					>
						<Autocomplete
							transitions={false}
							bind:input={filterItemNameLabel}
							options={filterItemNameOptions}
							on:selection={onItemNameSelected}
						/>
					</div>
				</div>
			</div>

			<!-- Rarity -->
			<div class="flex flex-row justify-between space-y-1">
				<label for="filterRarity" class="text-lg">Rarity:</label>
				<div class="">
					<input
						class="input variant-form-transparent pl-3"
						type="search"
						name="filterRarity"
						bind:value={filterRarityLabel}
						placeholder="None Selected"
						use:popup={popupFilterRaritySettings}
					/>
					<div
						data-popup="popupFilterRarity"
						class="max-h-48 p-4 overflow-y-auto bg-gray-600 rounded z-10"
						tabindex="-1"
					>
						<Autocomplete
							transitions={false}
							bind:input={filterRarityLabel}
							options={filterRarityOptions}
							on:selection={onRaritySelection}
						/>
					</div>
				</div>
			</div>
			<!-- Loot State -->
			<div class="flex flex-row justify-between space-y-1">
				<label for="filterLootState" class="text-lg">Loot State:</label>
				<div class="">
					<input
						class="input variant-form-transparent pl-3"
						type="search"
						name="filterLootState"
						bind:value={filterLootStateLabel}
						placeholder="None Selected..."
						use:popup={popupFilterLootStateSettings}
					/>
					<div
						data-popup="popupFilterLootState"
						class="max-h-48 p-4 overflow-y-auto bg-gray-600 rounded z-10"
						tabindex="-1"
					>
						<Autocomplete
							transitions={false}
							bind:input={filterLootStateLabel}
							options={filterLootStateOptions}
							on:selection={onLootStateSelection}
						/>
					</div>
				</div>
			</div>

			<!-- Max Price -->
			<div class="flex flex-row justify-between space-y-1">
				<label for="filterLootState" class="text-lg select-none">Max Price:</label>
				<div class="">
					<input
						class="input variant-form-transparent pl-3"
						type="number"
						name="filterMaxPrice"
						bind:value={selectedMaxPriceValue}
						placeholder="0 Gold"
					/>
				</div>
			</div>

			<!-- Apply -->
			<div class="relative space-y-3 grow flex items-end mr-6">
				<button
					on:click={onApplyNewFilter}
					type="button"
					class="w-full btn btn-sm variant-outline-primary"
				>
					<span class="text-md">Apply</span>
				</button>
			</div>
		</div>

		<!-- Properties -->
		<div class="w-full flex flex-row justify-start gap-2">
			<!-- Primary -->
			<div class="relative w-full flex flex-col border-r-2 border-r-gray-600/50 pr-2 mr-2">
				<div class="flex flex-row justify-between">
					<span class="w-full flex items-center justify-between text-lg">
						Primary Properties:
					</span>
					<button
						type="button"
						class="btn btn-sm"
						use:popup={popupFilterPrimaryProperties}
					>
						<Icon src={PlusCircle} outline class="h-5 w-5"></Icon>
					</button>
					<div
						data-popup="popupFilterPrimaryProperties"
						class="w-96 max-h-48 p-4 overflow-y-auto bg-gray-600 rounded z-10"
						tabindex="-1"
					>
						<Autocomplete
							transitions={false}
							options={filterPrimaryProperties}
							on:selection={onPrimaryPropertySelection}
						/>
					</div>
				</div>
				<hr class="!border-t-2 mb-2" />
				<div class="h-full flex flex-col">
					{#each primaryPropertiesList as property}
						<div class="flex flex-row justify-between">
							<span class="">{property.property}</span>
							<input
								type="number"
								class="input max-w-20 pl-3 text-center"
								value={property.value}
							/>
						</div>
					{/each}
				</div>
			</div>

			<!-- Secondary -->
			<div class="relative w-full flex flex-col">
				<div class="flex flex-row justify-between">
					<span class="w-full flex items-center justify-between text-lg">
						Secondary Properties:
					</span>
					<button
						type="button"
						class="btn btn-sm"
						use:popup={popupFilterSecondaryProperties}
					>
						<Icon src={PlusCircle} outline class="h-5 w-5"></Icon>
					</button>
					<div
						data-popup="popupFilterSecondaryProperties"
						class="w-full max-h-48 p-4 overflow-y-auto bg-gray-600 rounded z-10"
						tabindex="-1"
					>
						<Autocomplete
							transitions={false}
							options={filterSecondaryProperties}
							on:selection={onSecondaryPropertySelection}
						/>
					</div>
				</div>
				<hr class="!border-t-2 mb-2" />

				<div class="h-full flex flex-col">
					{#each secondaryPropertiesList as property}
						<div class="flex flex-row justify-between">
							<span class="">{property.property}</span>
							<input
								type="number"
								class="input max-w-20 pl-3 text-center"
								value={property.value}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
