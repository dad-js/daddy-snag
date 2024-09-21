import type { MarketplaceMyItemListRes, Unmessage } from "@dad-js/dad-api";
import type { SItem } from "@dad-js/dad-api/pb";
import type { Item, MarketplaceResponse } from "@dad-js/dad.js";
import { action, IPCContext, value } from "@shared/libs/ipc";

export interface SellerInfo {
	nickName: string;
	soldItems: number;
	lastUpdate: string;
}

export const marketplace = new IPCContext(
	{
		totalGold: value<number>({ default: 0 }),
		totalSpaceForGold: value<number>({ default: 0 }),

		refreshMarketplace: action<[], void>(),
		marketplaceItems: value<MarketplaceResponse>({ default: {} as MarketplaceResponse }),
		boughtItems: value<any[]>({ default: [] }),
		reloadPurchaseHistory: action<[], void>(),

		reloadMyListings: action<[], void>(),
		listedItems: value<any[]>({ default: [] }),
		sellItem: action<[Item, number], void>(),

		collectItem: action<[bigint], void>(),
		cancelListing: action<[bigint], void>(),

		toggleLogToFile: action<[boolean], void>(),
		logToFile: value<boolean>({ default: false }),

		toggleAutoBuy: action<[boolean], void>(),
		autoBuy: value<boolean>({ default: false }),

		toggleLogNames: action<[boolean], void>(),
		logNames: value<boolean>({ default: false }),
		loggedNames: value<SellerInfo[]>({ default: [] }),
		reloadLoggedNames: action<[], void>(),

		marketplaceFilters: value<any[]>({ default: [] }),
		addMarketplaceFilter: action<[{}], void>(),
		removeMarketplaceFilter: action<[{}], void>(),
	},
	{ namespace: "marketplace" },
);
