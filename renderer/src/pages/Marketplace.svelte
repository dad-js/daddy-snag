<script lang="ts">
	import {
		Autocomplete,
		popup,
		RadioGroup,
		RadioItem,
		type AutocompleteOption,
		type PopupSettings,
	} from "@skeletonlabs/skeleton";
	import { Icon, ArrowPath } from "svelte-hero-icons";

	import { dadclient, marketplace } from "@context";
	import {
		Accessories,
		Armors,
		CharacterClasses,
		Hands,
		ItemCategories,
		Miscs,
		Rarities,
		Slots,
		Utilities,
		Weapons,
	} from "@shared/libs/types";

	import ipc from "@libs/ipc";
	import type { IItemDBEntry } from "node_modules/@dad-js/dad-items/dist/types";
	import { onMount } from "svelte";

	// -> Default Settings
	let defaultPopupSettings: PopupSettings = {
		event: "focus-click",
		placement: "bottom-start",
		target: "",
	};

	// -> Autocomplete for Item Names
	let itemDB = ipc.value(dadclient, "itemDB");
	let listOfItems: IItemDBEntry[] = [];

	onMount(async () => {
		listOfItems = $itemDB.getItems();
	});

	let selectedItem: IItemDBEntry;
	let filterItemNameLabel: string = "";
	let filterItemNameOptions: AutocompleteOption<string>[] = [];

	const popupFilterItemNameSettings = { ...defaultPopupSettings, target: "popupFilterItemName" };
	const onItemNameSelected = (event: CustomEvent<AutocompleteOption<string>>): void => {
		filterItemNameLabel = event.detail.label;
		selectedItem = <IItemDBEntry>event.detail.meta;
	};

	$: {
		filterItemNameOptions = listOfItems?.map((item) => ({
			label: item.Name,
			value: item.Id,
			meta: item,
		}));
	}

	// Class List
	const classList = Object.keys(CharacterClasses)
		.map((key: any) => CharacterClasses[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});

	let sortClassList = [{ label: "Any", value: "Any" }, ...classList];
	let selectedClass: string = "Any";

	// Item Categories
	const itemCategories = Object.keys(ItemCategories)
		.map((key: any) => ItemCategories[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});

	let sortItemCategory = [{ label: "Any", value: "Any" }, ...itemCategories];
	let selectedItemCategory: string = "Any";

	const slots = Object.keys(Slots)
		.map((key: any) => Slots[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortSlot = [{ label: "Any", value: "Any" }, ...slots];

	const accessories = Object.keys(Accessories)
		.map((key: any) => Accessories[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortAccessories = [{ label: "Any", value: "Any" }, ...accessories];

	const armors = Object.keys(Armors)
		.map((key: any) => Armors[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortArmors = [{ label: "Any", value: "Any" }, ...armors];

	const hands = Object.keys(Hands)
		.map((key: any) => Hands[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortHands = [{ label: "Any", value: "Any" }, ...hands];

	const miscs = Object.keys(Miscs)
		.map((key: any) => Miscs[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortMiscs = [{ label: "Any", value: "Any" }, ...miscs];

	const rarities = Object.keys(Rarities)
		.map((key: any) => Rarities[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortRarity = [{ label: "Any", value: "Any" }, ...rarities];

	const utilities = Object.keys(Utilities)
		.map((key: any) => Utilities[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortUtilities = [{ label: "Any", value: "Any" }, ...utilities];

	const weapons = Object.keys(Weapons)
		.map((key: any) => Weapons[key])
		.filter((value) => typeof value === "string")
		.map((key) => {
			return { label: key, value: key };
		});
	let sortWeapons = [{ label: "Any", value: "Any" }, ...weapons];

	let sortByExtra: string = "Any";
	const sortList = new Map<string, { sort: any }>();
	sortList.set("Any", { sort: null });
	sortList.set(ItemCategories[ItemCategories.Slot], { sort: sortSlot });
	sortList.set(ItemCategories[ItemCategories.Accessory], { sort: sortAccessories });
	sortList.set(ItemCategories[ItemCategories.Armor], { sort: sortArmors });
	sortList.set(ItemCategories[ItemCategories.Hand], { sort: sortHands });
	sortList.set(ItemCategories[ItemCategories.Misc], { sort: sortMiscs });
	sortList.set(ItemCategories[ItemCategories.Rarity], { sort: sortRarity });
	sortList.set(ItemCategories[ItemCategories.Utility], { sort: sortUtilities });
	sortList.set(ItemCategories[ItemCategories.Weapon], { sort: sortWeapons });

	$: selectedItemCategory, (sortByExtra = "Any");

	const getSortByExtra = (itemCategory: string) => {
		return sortList.get(itemCategory)!.sort;
	};

	let showFilterByAttributes = true;
	let staticAttributes: any[] = [];
	let randomAttributes: any[] = [];

	$: staticAttributes;
	$: randomAttributes;

	const listOfStaticAttributes = [
		{ label: "ActionSpeed", value: "Id_ItemPropertyType_Effect_ActionSpeed", selected: 0 },
		{ label: "Agility", value: "Id_ItemPropertyType_Effect_Agility", selected: 0 },
		{
			label: "ArmorPenetration",
			value: "Id_ItemPropertyType_Effect_ArmorPenetration",
			selected: 0,
		},
		{ label: "ArmorRating", value: "Id_ItemPropertyType_Effect_ArmorRating", selected: 0 },
		{
			label: "ArmorRatingAdd",
			value: "Id_ItemPropertyType_Effect_ArmorRatingAdd",
			selected: 0,
		},
		{
			label: "BuffDurationBonus",
			value: "Id_ItemPropertyType_Effect_BuffDurationBonus",
			selected: 0,
		},
		{ label: "Dexterity", value: "Id_ItemPropertyType_Effect_Dexterity", selected: 0 },
		{
			label: "HeadshotReductionMod",
			value: "Id_ItemPropertyType_Effect_HeadshotReductionMod",
			selected: 0,
		},
		{ label: "Knowledge", value: "Id_ItemPropertyType_Effect_Knowledge", selected: 0 },
		{ label: "Luck", value: "Id_ItemPropertyType_Effect_Luck", selected: 0 },
		{ label: "MagicalDamage", value: "Id_ItemPropertyType_Effect_MagicalDamage", selected: 0 },
		{
			label: "MagicalDamageAdd",
			value: "Id_ItemPropertyType_Effect_MagicalDamageAdd",
			selected: 0,
		},
		{
			label: "MagicalDamageBonus",
			value: "Id_ItemPropertyType_Effect_MagicalDamageBonus",
			selected: 0,
		},
		{
			label: "MagicalDamageReduction",
			value: "Id_ItemPropertyType_Effect_MagicalDamageReduction",
			selected: 0,
		},
		{
			label: "MagicalDamageTrue",
			value: "Id_ItemPropertyType_Effect_MagicalDamageTrue",
			selected: 0,
		},
		{
			label: "MagicalHealing",
			value: "Id_ItemPropertyType_Effect_MagicalHealing",
			selected: 0,
		},
		{ label: "MagicalPower", value: "Id_ItemPropertyType_Effect_MagicalPower", selected: 0 },
		{
			label: "MagicalWeaponDamage",
			value: "Id_ItemPropertyType_Effect_MagicalWeaponDamage",
			selected: 0,
		},
		{
			label: "MagicPenetration",
			value: "Id_ItemPropertyType_Effect_MagicPenetration",
			selected: 0,
		},
		{
			label: "MagicRegistance",
			value: "Id_ItemPropertyType_Effect_MagicRegistance",
			selected: 0,
		},
		{ label: "MaxHealthAdd", value: "Id_ItemPropertyType_Effect_MaxHealthAdd", selected: 0 },
		{
			label: "MaxHealthBonus",
			value: "Id_ItemPropertyType_Effect_MaxHealthBonus",
			selected: 0,
		},
		{ label: "MoveSpeed", value: "Id_ItemPropertyType_Effect_MoveSpeed", selected: 0 },
		{
			label: "MoveSpeedBonus",
			value: "Id_ItemPropertyType_Effect_MoveSpeedBonus",
			selected: 0,
		},
		{
			label: "PhysicalDamageReduction",
			value: "Id_ItemPropertyType_Effect_PhysicalDamageReduction",
			selected: 0,
		},
		{
			label: "PhysicalDamageTrue",
			value: "Id_ItemPropertyType_Effect_PhysicalDamageTrue",
			selected: 0,
		},
		{ label: "PhysicalPower", value: "Id_ItemPropertyType_Effect_PhysicalPower", selected: 0 },
		{
			label: "PhysicalWeaponDamage",
			value: "Id_ItemPropertyType_Effect_PhysicalWeaponDamage",
			selected: 0,
		},
		{
			label: "PhysicalWeaponDamageAdd",
			value: "Id_ItemPropertyType_Effect_PhysicalWeaponDamageAdd",
			selected: 0,
		},
		{
			label: "ProjectileReductionMod",
			value: "Id_ItemPropertyType_Effect_ProjectileReductionMod",
			selected: 0,
		},
		{
			label: "RegularInteractionSpeed",
			value: "Id_ItemPropertyType_Effect_RegularInteractionSpeed",
			selected: 0,
		},
		{
			label: "Resourcefulness",
			value: "Id_ItemPropertyType_Effect_Resourcefulness",
			selected: 0,
		},
		{ label: "Strength", value: "Id_ItemPropertyType_Effect_Strength", selected: 0 },
		{
			label: "UndeadDamageMod",
			value: "Id_ItemPropertyType_Effect_UndeadDamageMod",
			selected: 0,
		},
		{ label: "Vigor", value: "Id_ItemPropertyType_Effect_Vigor", selected: 0 },
		{ label: "Will", value: "Id_ItemPropertyType_Effect_Will", selected: 0 },
	];

	const listOfRandomAttributes = [
		{ label: "ActionSpeed", value: "Id_ItemPropertyType_Effect_ActionSpeed", selected: 0 },
		{ label: "Agility", value: "Id_ItemPropertyType_Effect_Agility", selected: 0 },
		{
			label: "ArmorPenetration",
			value: "Id_ItemPropertyType_Effect_ArmorPenetration",
			selected: 0,
		},
		{
			label: "ArmorRatingAdd",
			value: "Id_ItemPropertyType_Effect_ArmorRatingAdd",
			selected: 0,
		},
		{
			label: "BuffDurationBonus",
			value: "Id_ItemPropertyType_Effect_BuffDurationBonus",
			selected: 0,
		},
		{
			label: "DebuffDurationBonus",
			value: "Id_ItemPropertyType_Effect_DebuffDurationBonus",
			selected: 0,
		},
		{ label: "Dexterity", value: "Id_ItemPropertyType_Effect_Dexterity", selected: 0 },
		{ label: "Knowledge", value: "Id_ItemPropertyType_Effect_Knowledge", selected: 0 },
		{ label: "Luck", value: "Id_ItemPropertyType_Effect_Luck", selected: 0 },
		{
			label: "MagicalDamageAdd",
			value: "Id_ItemPropertyType_Effect_MagicalDamageAdd",
			selected: 0,
		},
		{
			label: "MagicalDamageBonus",
			value: "Id_ItemPropertyType_Effect_MagicalDamageBonus",
			selected: 0,
		},
		{
			label: "MagicalDamageReduction",
			value: "Id_ItemPropertyType_Effect_MagicalDamageReduction",
			selected: 0,
		},
		{
			label: "MagicalDamageTrue",
			value: "Id_ItemPropertyType_Effect_MagicalDamageTrue",
			selected: 0,
		},
		{
			label: "MagicalHealing",
			value: "Id_ItemPropertyType_Effect_MagicalHealing",
			selected: 0,
		},
		{
			label: "MagicalInteractionSpeed",
			value: "Id_ItemPropertyType_Effect_MagicalInteractionSpeed",
			selected: 0,
		},
		{ label: "MagicalPower", value: "Id_ItemPropertyType_Effect_MagicalPower", selected: 0 },
		{
			label: "MagicPenetration",
			value: "Id_ItemPropertyType_Effect_MagicPenetration",
			selected: 0,
		},
		{
			label: "MagicRegistance",
			value: "Id_ItemPropertyType_Effect_MagicRegistance",
			selected: 0,
		},
		{ label: "MaxHealthAdd", value: "Id_ItemPropertyType_Effect_MaxHealthAdd", selected: 0 },
		{
			label: "MaxHealthBonus",
			value: "Id_ItemPropertyType_Effect_MaxHealthBonus",
			selected: 0,
		},
		{
			label: "MemoryCapacityAdd",
			value: "Id_ItemPropertyType_Effect_MemoryCapacityAdd",
			selected: 0,
		},
		{
			label: "MemoryCapacityBonus",
			value: "Id_ItemPropertyType_Effect_MemoryCapacityBonus",
			selected: 0,
		},
		{ label: "MoveSpeedAdd", value: "Id_ItemPropertyType_Effect_MoveSpeedAdd", selected: 0 },
		{
			label: "MoveSpeedBonus",
			value: "Id_ItemPropertyType_Effect_MoveSpeedBonus",
			selected: 0,
		},
		{
			label: "PhysicalDamageAdd",
			value: "Id_ItemPropertyType_Effect_PhysicalDamageAdd",
			selected: 0,
		},
		{
			label: "PhysicalDamageBonus",
			value: "Id_ItemPropertyType_Effect_PhysicalDamageBonus",
			selected: 0,
		},
		{
			label: "PhysicalDamageReduction",
			value: "Id_ItemPropertyType_Effect_PhysicalDamageReduction",
			selected: 0,
		},
		{
			label: "PhysicalDamageTrue",
			value: "Id_ItemPropertyType_Effect_PhysicalDamageTrue",
			selected: 0,
		},
		{
			label: "PhysicalHealing",
			value: "Id_ItemPropertyType_Effect_PhysicalHealing",
			selected: 0,
		},
		{ label: "PhysicalPower", value: "Id_ItemPropertyType_Effect_PhysicalPower", selected: 0 },
		{
			label: "PhysicalWeaponDamageAdd",
			value: "Id_ItemPropertyType_Effect_PhysicalWeaponDamageAdd",
			selected: 0,
		},
		{ label: "Primitive", value: "Id_ItemPropertyType_Effect_Primitive", selected: 0 },
		{
			label: "ProjectileReductionMod",
			value: "Id_ItemPropertyType_Effect_ProjectileReductionMod",
			selected: 0,
		},
		{
			label: "RegularInteractionSpeed",
			value: "Id_ItemPropertyType_Effect_RegularInteractionSpeed",
			selected: 0,
		},
		{
			label: "Resourcefulness",
			value: "Id_ItemPropertyType_Effect_Resourcefulness",
			selected: 0,
		},
		{
			label: "SpellCastingSpeed",
			value: "Id_ItemPropertyType_Effect_SpellCastingSpeed",
			selected: 0,
		},
		{ label: "Strength", value: "Id_ItemPropertyType_Effect_Strength", selected: 0 },
		{ label: "Vigor", value: "Id_ItemPropertyType_Effect_Vigor", selected: 0 },
		{ label: "Will", value: "Id_ItemPropertyType_Effect_Will", selected: 0 },
	];
</script>

<div
	class="relative h-full max-h-[calc(100vh-1.5rem)] px-2 py-4 select-none w-full overflow-hidden"
>
	<!-- Responsive Container (recommended) -->
	<div class="table-container">
		<!-- Native Table Element -->
		<table class="table table-compact">
			<thead>
				<tr>
					<th class="table-cell-fit"></th>
					<th>Item Name</th>
					<th>Class</th>
					<th>Category</th>
					<th>Type</th>
					<th>Primary</th>
					<th>Secondary</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				<tr class="[&>td]:!align-middle">
					<td class=""><div class="w-16 h-16"></div></td>
					<td class=" align-middle">
						<!-- Item Name -->
						<div class="py-2">
							<input
								class="input variant-form-transparent"
								type="search"
								name="filterItemName"
								bind:value={filterItemNameLabel}
								placeholder="Search..."
								use:popup={popupFilterItemNameSettings}
							/>
							<div
								data-popup="popupFilterItemName"
								class="max-h-48 p-4 overflow-y-auto bg-surface-500 rounded z-10"
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
						<!-- /Item Name-->
					</td>
					<td>
						<div class="relative flex flex-col">
							<select
								name="sortByClass"
								class="select !bg-transparent !border-0"
								bind:value={selectedClass}
							>
								{#each sortClassList as charClass}
									<option value={charClass.value}>{charClass.label}</option>
								{/each}
							</select>
						</div>
					</td>
					<td>
						<div class="relative flex flex-col">
							<div class="relative">
								<select
									name="sortByItemCategory"
									class="select !bg-transparent !border-0"
									bind:value={selectedItemCategory}
								>
									{#each sortItemCategory as itemCategory}
										<option value={itemCategory.value}>
											{itemCategory.label}
										</option>
									{/each}
								</select>
							</div>
						</div>
					</td>
					<td>
						<div class="relative flex flex-col">
							<div class="relative">
								<select
									name="sortBySlot"
									class="select !bg-transparent !border-0"
									bind:value={sortByExtra}
								>
									{#if sortList.get(selectedItemCategory)?.sort?.length > 1}
										{#each getSortByExtra(selectedItemCategory) as sortExtra}
											<option value={sortExtra.value}>
												{sortExtra.label}
											</option>
										{/each}
									{:else}
										<option value="Any">Any</option>
									{/if}
								</select>
							</div>
						</div>
					</td>
					<td>
						<select
							name="sortByProperty"
							class="select !bg-transparent !border-0"
							multiple={false}
						>
							<option value="Any">
								<span class="">Any</span>
							</option>
							{#each listOfStaticAttributes as staticAttribute}
								<option value={staticAttribute.value}>
									<div>{staticAttribute.label}</div>
									<input
										type="number"
										bind:value={staticAttribute.selected}
										class="w-4 pointer-events-auto"
									/>
								</option>
							{/each}
						</select>
					</td>
					<td>
						<select
							name="sortByPropertySec"
							class="select !bg-transparent !border-0"
							multiple={false}
						>
							<option value="Any">
								<span class="">Any</span>
							</option>
							{#each listOfRandomAttributes as randomAttribute}
								<option value={randomAttribute.value}>
									<div>{randomAttribute.label}</div>
									<input
										type="number"
										bind:value={randomAttribute.selected}
										class="w-4 pointer-events-auto"
									/>
								</option>
							{/each}
						</select>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style lang="postcss">
</style>
