import type { Unmessage } from "@dad-js/dad-api";
import type { SCHATDATA, SCHATDATA_PIECE } from "@dad-js/dad-api/pb";
import { action, IPCContext, value } from "@shared/libs/ipc";

export type WhisperMessage = {
	targetNickName?: string;
	chatData?: Unmessage<SCHATDATA>;
	timestamp: string;
};

export interface Conversation {
	name: string;
	newMessageCount: number;
	updateTimestamp: string;
}

export interface MessageFeed {
	id: number;
	host: boolean;
	avatar: number;
	name: string;
	timestamp: string;
	message: string;
	color: string;
}

export const listOfStaticAttributes = [
	{ label: "ActionSpeed", value: "Id_ItemPropertyType_Effect_ActionSpeed", selected: 0 },
	{ label: "Agility", value: "Id_ItemPropertyType_Effect_Agility", selected: 0 },
	{
		label: "ArmorPenetration",
		value: "Id_ItemPropertyType_Effect_ArmorPenetration",
		selected: 0,
	},
	{ label: "ArmorRating", value: "Id_ItemPropertyType_Effect_ArmorRating", selected: 0 },
	{ label: "ArmorRatingAdd", value: "Id_ItemPropertyType_Effect_ArmorRatingAdd", selected: 0 },
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
	{ label: "MagicalHealing", value: "Id_ItemPropertyType_Effect_MagicalHealing", selected: 0 },
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
	{ label: "MagicRegistance", value: "Id_ItemPropertyType_Effect_MagicRegistance", selected: 0 },
	{ label: "MaxHealthAdd", value: "Id_ItemPropertyType_Effect_MaxHealthAdd", selected: 0 },
	{ label: "MaxHealthBonus", value: "Id_ItemPropertyType_Effect_MaxHealthBonus", selected: 0 },
	{ label: "MoveSpeed", value: "Id_ItemPropertyType_Effect_MoveSpeed", selected: 0 },
	{ label: "MoveSpeedBonus", value: "Id_ItemPropertyType_Effect_MoveSpeedBonus", selected: 0 },
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
	{ label: "Resourcefulness", value: "Id_ItemPropertyType_Effect_Resourcefulness", selected: 0 },
	{ label: "Strength", value: "Id_ItemPropertyType_Effect_Strength", selected: 0 },
	{ label: "UndeadDamageMod", value: "Id_ItemPropertyType_Effect_UndeadDamageMod", selected: 0 },
	{ label: "Vigor", value: "Id_ItemPropertyType_Effect_Vigor", selected: 0 },
	{ label: "Will", value: "Id_ItemPropertyType_Effect_Will", selected: 0 },
];

export type ItemPropertyMessage = {
	name: string;
	iid: string;
	uid: string;
	pp: { property: string; value: number }[];
	sp: { property: string; value: number }[];
};
export type CustomMessageString = {
	type: string;
	value: any;
};

export const chat = new IPCContext(
	{
		listOfConversations: value<Conversation[]>({ default: [] }),
		deleteConversation: action<[string], void>(),

		loadBufferedMessages: action<[], void>(),
		loadChatHistory: action<[], void>(),

		sendWhisperMessage: action<[string, Unmessage<SCHATDATA_PIECE>[]], void>(),
		targetNickname: value<string>({ default: "" }),
		setTargetNickname: action<[string], void>(),
		whisperMessages: value<WhisperMessage[]>({
			default: [],
		}),

		saveMessage: action<[CustomMessageString[]], void>(),
		deleteMessage: action<[number], void>(),
		savedMessages: value<CustomMessageString[][]>({ default: [] }),
	},
	{ namespace: "chat" },
);
