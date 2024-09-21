import type { Inventory, ItemPosition } from "@dad-js/dad.js";
import { action, IPCContext, value } from "@shared/libs/ipc";

export const lobby = new IPCContext(
	{
		equipment: value<Inventory>({ default: { id: 3, items: [] } }),
		inventory: value<Inventory>({ default: { id: 2, items: [] } }),
		stash: value<Inventory[]>({ default: [{ id: 4, items: [] }] }),
		moveItem: action<[ItemPosition, Omit<ItemPosition, "uid">], void>(),
	},
	{ namespace: "lobby" },
);
