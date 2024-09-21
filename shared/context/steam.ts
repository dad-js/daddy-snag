import type { SteamworksData } from "@workers/steamworks";
import { action, IPCContext, value } from "@shared/libs/ipc";

export const steam = new IPCContext(
	{
		isConnected: value<boolean>({ default: false }),
		info: value<SteamworksData>({
			default: {
				username: "N/A",
				steamId64: BigInt(0),
				authSessionTicket: "",
			},
		}),
	},
	{ namespace: "steam" },
);
