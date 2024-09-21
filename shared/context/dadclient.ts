import { type PacketName, type AccountLoginRes } from "@dad-js/dad-api";
import ItemDB from "@dad-js/dad-items";
import { type CharacterInfo, type DirectionalPacket } from "@dad-js/dad.js";
import { action, IPCContext, value } from "@shared/libs/ipc";

// TODO: Move this to dedicated settings
export const MAX_PACKET_HISTORY = 128;

export const dadclient = new IPCContext(
	{
		isConnected: value<boolean>({ default: false }),
		characterList: value<CharacterInfo[]>({ default: [] }),
		selectedCharacter: value<CharacterInfo | undefined>(),
		accountInfo: value<AccountLoginRes>(),
		selectCharacter: action<[string], void>(),
		packetLog: value<DirectionalPacket[]>({ default: [] }),
		lastPacket: value<DirectionalPacket>(),
		sendPacket: action<[PacketName, any], void>(),
		itemDB: value<ItemDB>({ default: new ItemDB() }),
	},
	{ namespace: "dadclient" },
);
