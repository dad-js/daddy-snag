export enum CharacterClasses {
	"Fighter",
	"Barbarian",
	"Rogue",
	"Ranger",
	"Wizard",
	"Cleric",
	"Bard",
	"Warlock",
	"Druid",
}

export enum ItemCategories {
	"Slot",
	"Accessory",
	"Armor",
	"Hand",
	"Misc",
	"Rarity",
	"Utility",
	"Weapon",
}

export enum Slots {
	"Unarmed",
	"Head",
	"Chest",
	"Hands",
	"Legs",
	"Foot",
	"Necklace",
	"Back",
	"Utility",
	"Primary",
	"Secondary",
}

export enum Accessories {
	"Necklace",
	"Ring",
}

export enum Armors {
	"Cloth",
	"Leather",
	"Plate",
}

export enum Hands {
	"OneHanded",
	"TwoHanded",
}

export enum Miscs {
	"Arrow",
	"Bolt",
	"Gold Container",
	"Currency",
	"Gem",
	"Herb",
	"HuntingLoot",
	"Ingot",
	"Ore",
	"Powder",
}

export enum Rarities {
	"Common",
	"Epic",
	"Legend",
	"Poor",
	"Rare",
	"Uncommon",
	"Unique",
}

export enum Utilities {
	"Consumable",
	"Drink",
	"Installable",
	"Mining",
	"Instrument",
	"Throwable",
}

export enum Weapons {
	"Axe",
	"Bow",
	"Crossbow",
	"Dagger",
	"Mace",
	"MagicStuff",
	"Polearm",
	"Shield",
	"Staff",
	"Sword",
}

export interface ItemCategory {
	Slot:
		| "Type.Item.Slot.Unarmed"
		| "Type.Item.Slot.Head"
		| "Type.Item.Slot.Chest"
		| "Type.Item.Slot.Hands"
		| "Type.Item.Slot.Legs"
		| "Type.Item.Slot.Foot"
		| "Type.Item.Slot.Necklace"
		| "Type.Item.Slot.Back"
		| "Type.Item.Slot.Utility"
		| "Type.Item.Slot.Primary"
		| "Type.Item.Slot.Secondary"
		| "Type.Item.Slot.SoulHeart";

	Accessory: "Type.Item.Accessory.Necklace" | "Type.Item.Accessory.Ring";

	Armor: "Type.Item.Armor.Cloth" | "Type.Item.Armor.Leather" | "Type.Item.Armor.Plate";

	Hand: "Type.Item.Hand.OneHanded" | "Type.Item.Hand.TwoHanded";

	Misc:
		| "Type.Item.Misc.Ammo.Arrow"
		| "Type.Item.Misc.Ammo.Bolt"
		| "Type.Item.Misc.Container.Gold"
		| "Type.Item.Misc.Currency"
		| "Type.Item.Misc.Currency.Gold"
		| "Type.Item.Misc.Gem"
		| "Type.Item.Misc.Herb"
		| "Type.Item.Misc.HuntingLoot"
		| "Type.Item.Misc.Ingot"
		| "Type.Item.Misc.Ore"
		| "Type.Item.Misc.Powder";

	Rarity:
		| "Type.Item.Rarity.Common"
		| "Type.Item.Rarity.Epic"
		| "Type.Item.Rarity.Legend"
		| "Type.Item.Rarity.Poor"
		| "Type.Item.Rarity.Rare"
		| "Type.Item.Rarity.Uncommon"
		| "Type.Item.Rarity.Unique";

	Utility:
		| "Type.Item.Utility.Consumable"
		| "Type.Item.Utility.Drink"
		| "Type.Item.Utility.Installable.CampfireKit"
		| "Type.Item.Utility.Installable.Trap"
		| "Type.Item.Utility.Mining"
		| "Type.Item.Utility.MusicalInstrument.Percussion"
		| "Type.Item.Utility.MusicalInstrument.String"
		| "Type.Item.Utility.MusicalInstrument.Wind"
		| "Type.Item.Utility.SoulHeart"
		| "Type.Item.Utility.Throwable";

	Weapon:
		| "Type.Item.Weapon.Axe"
		| "Type.Item.Weapon.Bow"
		| "Type.Item.Weapon.Crossbow"
		| "Type.Item.Weapon.Dagger"
		| "Type.Item.Weapon.Mace"
		| "Type.Item.Weapon.MagicStuff"
		| "Type.Item.Weapon.Polearm"
		| "Type.Item.Weapon.Shield"
		| "Type.Item.Weapon.Staff"
		| "Type.Item.Weapon.Sword"
		| "Type.Item.Weapon.Unarmed";
}

export type ItemTypes<T extends keyof ItemCategory> = ItemCategory[T];
