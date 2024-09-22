import { app } from "electron";
import { createWriteStream, readFileSync, writeFile, type WriteStream } from "original-fs";

import { Inject, Service } from "@electron/libs/di";
import { logger, stripTag } from "@electron/libs/utils";
import { DaDClientService, AppService } from "@services";
import { ui, marketplace, type ToastOption, type SellerInfo } from "@context";
import type { MarketplaceMyItemListRes, Unmessage } from "@dad-js/dad-api/";
import type { Item } from "@dad-js/dad.js";

import {
	MARKETPLACE_FILTER,
	PacketResult,
	type SItem,
	type SMARKETPLACE_FILTER_INFO,
	type SMARKETPLACE_TRADE_ITEM_INFO,
	type SMARKETPLACE_TRADE_SLOT_INFO,
} from "@dad-js/dad-api/pb";
import { Store, Readable, type MarketplaceResponse, mapItem } from "@dad-js/dad.js";
import moment from "moment";

@Service
export class MarketplaceService {
	@Inject dad!: DaDClientService;
	@Inject app!: AppService;

	@ui.Expose("toastMessage") toastMessage!: ToastOption;

	@marketplace.Store("marketplaceItems") marketplaceItems: Store<MarketplaceResponse> = new Store(
		{} as MarketplaceResponse,
	);
	@marketplace.Store("listedItems") listedItems: Store<any[]> = new Store([]);
	@marketplace.Store("marketplaceFilters") marketplaceFilters: Store<any[]> = new Store([]);

	@marketplace.Expose("autoBuy") autoBuy: boolean = false;
	@marketplace.Store("boughtItems") boughtItems: Store<any[]> = new Store([]);

	@marketplace.Expose("logNames") logNames: boolean = false;
	@marketplace.Store("loggedNames") loggedNames: Store<SellerInfo[]> = new Store([]);

	@marketplace.Expose("totalGold") totalGold: number = 0;
	@marketplace.Expose("totalSpaceForGold") totalSpaceForGold: number = 0;

	@marketplace.Expose("logToFile") logToFile: boolean = false;

	#logFS: WriteStream | null = null;
	#logNamesFS: WriteStream | null = null;

	#listedItems: BigInt[] = [];
	#seenListings: string[] = [];
	#seenNames: string[] = [];

	#autoBuyInterval: any | null = null;

	async onStart() {
		logger.info("Starting DaD Marketplace service  ");
		this.#loadMarketplaceFilters();
		this.#loadPurchaseHistory();

		this.#addListeners();
		this.#updateGold();

		this.#loadLoggedNames();
		this.toggleLogNames(true);
	}

	#addListeners() {
		this.app.mainWindow.once("close", (e) => {
			this.#saveLoggedNames();
			this.#logNamesFS?.end();
			this.#logNamesFS?.close();
		});

		process.on("SIGTERM", () => {
			this.#saveLoggedNames();
			this.#logNamesFS?.end();
			this.#logNamesFS?.close();
		});

		this.dad.client.marketplace.marketplaceItems.subscribe((v) => {
			if (v !== undefined && Object.keys(v).length !== 0) {
				if (this.logToFile) {
					const itemList = [];

					for (let item of v.items) {
						if (!this.#listedItems.includes(item.listingId)) {
							this.#listedItems.push(item.listingId);

							this.#logFS?.write(
								JSON.stringify(
									item,
									(_, v) => (typeof v === "bigint" ? v.toString() : v),
									2,
								) + ",\r\n",
							);
						}
					}
				}

				if (this.logNames) {
					for (let item of v.items) {
						if (!this.#seenListings.includes(item.listingId.toString())) {
							const sellerEntry = this.loggedNames.value.find(
								(c) => c.nickName === item.nickname!.originalNickName,
							);

							if (sellerEntry) {
								this.loggedNames.set([
									...this.loggedNames.value.filter(
										(c) => c.nickName !== item.nickname!.originalNickName,
									),
									{
										nickName: item.nickname!.originalNickName,
										soldItems: sellerEntry.soldItems + 1,
										lastUpdate: moment().format(),
									},
								]);
							} else {
								this.loggedNames.set([
									...this.loggedNames.value,
									{
										nickName: item.nickname!.originalNickName,
										soldItems: 1,
										lastUpdate: moment().format(),
									},
								]);
							}
						}
					}
				}
				this.#checkForAutoBuy(v);
			}
		});

		this.dad.client.api.marketPlace.onMarketplaceMyItemListRes((v) => {
			const smpl: any[] = [];
			v.myItemInfos.forEach(async (y) => {
				smpl.push({
					listingId: y.itemInfo?.listingId,
					state: y.myItemState,
					price: y.itemInfo?.price,
					remainingTime: y.itemInfo?.remainExpirationTime,
					itemData: await mapItem(y.itemInfo!.item!),
				});
			});
			this.listedItems.set(smpl);
			this.#updateGold();
		});

		this.dad.client.api.marketPlace.onMarketplaceItemHasSoldNot((v) => {
			if (v.isSold > 0) {
				this.toastMessage = {
					message: `An Item has been sold!`,
				};
			}
		});

		this.dad.client.api.lobby.onLobbyCharacterInfoRes((v) => {
			this.#updateGold();
		});
	}

	async #updateGold() {
		this.totalSpaceForGold = await this.#getTotalSpaceForGold();
		this.totalGold = await this.#getTotalGold();
	}

	#checkForAutoBuy(marketData: MarketplaceResponse) {
		if (!this.autoBuy) return;
		if (!marketData.items) return;

		for (const entry of marketData.items) {
			if (!this.#seenListings.includes(entry.listingId.toString())) {
				this.#seenListings.push(entry.listingId.toString());

				this.marketplaceFilters.value.forEach(async (filter) => {
					if (!this.#satisfiesAllFilters(entry, filter)) {
						return;
					}
					this.#buyItem(entry);
				});
			}
		}
	}

	#shouldConsiderItem(
		item: MarketplaceResponse["items"][0],
		filters: [SMARKETPLACE_FILTER_INFO, Record<string, any>],
	) {
		for (const filterInfo of filters) {
			//logger.info(filterInfo);
			if (filterInfo.filterType && filterInfo.filterType === MARKETPLACE_FILTER.NAME) {
				//logger.info(filterInfo.filters);
				//logger.info(item.item.data.itemTag);
				if (filterInfo.filters.includes(item.item.data.itemTag)) return true;
			}
		}

		return false;
	}

	#satisfiesAllFilters(
		item: MarketplaceResponse["items"][0],
		filters: [SMARKETPLACE_FILTER_INFO, Record<string, any>],
	) {
		if (!this.#shouldConsiderItem(item, filters)) return false;
		//logger.info(`Considering item: ${item.item.data.itemTag}`);

		// Check the standard filters
		for (const filter of filters) {
			if (filter.filterType) {
				switch (filter.filterType) {
					case MARKETPLACE_FILTER.RARITY:
						if (!filter.filters.includes(item.item.data.raritytype)) {
							return false;
						}
						break;
					case MARKETPLACE_FILTER.SLOT:
						if (!filter.filters.includes(item.item.slot.toString())) {
							return false;
						}
						break;
					case MARKETPLACE_FILTER.TYPE:
						if (!filter.filters.includes(item.item.data.itemType)) {
							return false;
						}
						break;
					case MARKETPLACE_FILTER.STATIC_ATTRIBUTE:
						const primaryPropsMatch = item.item.primaryProperties.some((prop) =>
							filter.filters.includes(prop.type),
						);
						if (!primaryPropsMatch) {
							return false;
						}
						break;
					case MARKETPLACE_FILTER.RANDOM_ATTRIBUTE:
						const secondaryPropsMatch = item.item.secondaryProperties.some((prop) =>
							filter.filters.includes(prop.type),
						);
						if (!secondaryPropsMatch) {
							return false;
						}
						break;
					default:
						break;
				}
			}

			// Check the custom filters
			if ("minCount" in filter && item.item.count < filter["minCount"]) {
				return false;
			}

			if ("maxPrice" in filter && item.price > filter["maxPrice"]) {
				return false;
			}
		}

		return true;
	}

	async #buyItem(item: MarketplaceResponse["items"][0]) {
		logger.info(
			`I would buy this item: ${item.item.data.name} (${item.listingId}) - (${item.price} Gold) `,
		);

		const requiredGoldCoins = await this.#getRequiredGoldCoins(item.price);
		if (requiredGoldCoins) {
			this.dad.client.marketplace.buyItem(item.listingId, requiredGoldCoins);

			this.toastMessage = {
				message: `Bought ${item.item.data.name} for ${item.price} from ${item.nickname?.originalNickName}`,
				background: "variant-filled-primary",
			};
			this.boughtItems.set([...this.boughtItems.value, { ...item, date: new Date() }]);

			this.#savePurchaseHistory();
		} else {
			this.toastMessage = {
				message: `Could not buy ${item.item.data.name} for ${item.price} from ${item.nickname?.originalNickName} - Not enough money`,
				background: "variant-filled-error",
			};
		}
	}

	async #getRequiredGoldCoins(reqPrice: number) {
		let availableGoldCoins: Item[] = [];
		for await (const inventory of this.dad.client.lobby.allInventories.value) {
			inventory.items
				.filter(
					(xItem) =>
						(xItem.id === "DesignDataItem:Id_Item_GoldCoinPurse" ||
							xItem.id === "DesignDataItem:Id_Item_GoldCoinBag" ||
							xItem.id === "DesignDataItem:Id_Item_GoldCoinChest") &&
						xItem.contents > 1,
				)
				.forEach((xx) => availableGoldCoins.push(xx));
		}

		let requiredPrice = reqPrice;
		const listOfGoldBags = [];
		for await (const goldCoins of availableGoldCoins) {
			if (requiredPrice > goldCoins.contents) {
				listOfGoldBags.push({
					itemUniqueId: goldCoins.uid,
					itemContentsCount: goldCoins.contents,
					itemCount: 0,
					slotId: -1,
				} as Unmessage<SMARKETPLACE_TRADE_ITEM_INFO>);

				requiredPrice -= goldCoins.contents;
			} else {
				listOfGoldBags.push({
					itemUniqueId: goldCoins.uid,
					itemContentsCount: requiredPrice,
					itemCount: 0,
					slotId: -1,
				} as Unmessage<SMARKETPLACE_TRADE_ITEM_INFO>);

				requiredPrice = 0;
			}

			if (requiredPrice == 0) break;
		}

		return requiredPrice == 0 ? listOfGoldBags : false;
	}

	@marketplace.Handle("refreshMarketplace")
	async refreshMarketplace() {
		const refreshData = await this.dad.client.marketplace.refreshDefaultMarketplace();
		this.marketplaceItems.value = refreshData;
	}

	@marketplace.Handle("toggleLogToFile")
	async toggleLogToFile(toggle: boolean) {
		this.logToFile = toggle;
		if (this.logToFile) {
			const path = app.getPath("userData");
			logger.info(`Saving marketHistory data to ${path}/marketHistory.json`);

			this.#logFS = createWriteStream(`${path}/marketHistory.json`, { flags: "a+" });
		} else {
			this.#logFS?.end();
		}
	}

	@marketplace.Handle("reloadLoggedNames")
	async reloadLoggedNames() {
		this.#loadLoggedNames();
	}

	@marketplace.Handle("toggleLogNames")
	async toggleLogNames(toggle: boolean) {
		if (this.logNames === toggle) return;
		this.logNames = toggle;

		const path = app.getPath("userData");

		if (this.logNames) {
			logger.info(`Saving logged names to ${path}/loggedNames.json`);

			this.#logNamesFS = createWriteStream(`${path}/loggedNames.json`, { flags: "w+" });
		} else {
			logger.info(`Stopped logging - ${path}/loggedNames.json`);

			this.#saveLoggedNames();
			this.#logNamesFS?.end();
		}
	}

	#saveLoggedNames() {
		this.#logNamesFS?.write(
			JSON.stringify(
				this.loggedNames.value,
				(_, v) => (typeof v === "bigint" ? v.toString() : v),
				2,
			),
		);
	}

	#loadLoggedNames() {
		try {
			const path = app.getPath("userData");
			const data = readFileSync(`${path}/loggedNames.json`, "utf8");
			const names = JSON.parse(data);

			this.loggedNames.set(names);
			this.toastMessage = {
				message: `Logged Names loaded.`,
				background: "bg-surface-500",
			};
		} catch (err) {
			logger.info(`Failed to load logged characters: ${err}`);
		}
	}

	@marketplace.Handle("toggleAutoBuy")
	async toggleAutoBuy(toggle: boolean) {
		if (this.autoBuy === toggle) return;
		this.autoBuy = toggle;

		if (toggle) {
			logger.info(`Enabled Auto Buy`);
			this.#startAutoBuy();
		} else {
			logger.info(`Disabled Auto Buy`);
			this.#stopAutoBuy();
		}
	}

	#startAutoBuy() {
		this.#autoBuyInterval = setInterval(() => {
			this.refreshMarketplace();
		}, 500);
	}

	#stopAutoBuy() {
		clearInterval(this.#autoBuyInterval);
	}

	@marketplace.Handle("addMarketplaceFilter")
	async addMarketplaceFilter(filter: any) {
		logger.info(`Adding filter: ${JSON.stringify(filter)}`);
		this.toastMessage = {
			message: `Filter added.`,
			background: "bg-surface-500",
		};

		this.marketplaceFilters.set([...this.marketplaceFilters.value, filter]);

		this.#saveMarketplaceFilters();
	}

	@marketplace.Handle("removeMarketplaceFilter")
	async removeMarketplaceFilter(filter: any) {
		logger.info(`Removing filter: ${JSON.stringify(filter)}`);
		this.toastMessage = {
			message: `Filter removed.`,
			background: "bg-surface-500",
		};

		const updatedFilters = this.marketplaceFilters.value.filter(
			(f) => f[0]["filters"][0] !== filter[0]["filters"][0],
		);
		this.marketplaceFilters.set(updatedFilters);

		this.#saveMarketplaceFilters();
	}

	#saveMarketplaceFilters() {
		const path = app.getPath("userData");
		const filters = JSON.stringify(this.marketplaceFilters.value, null, 2);

		writeFile(`${path}/marketplaceFilters.json`, filters, (err) => {
			if (err) {
				logger.info(`Failed to save marketplace filters: ${err}`);
			}
		});
	}

	#loadMarketplaceFilters() {
		try {
			const path = app.getPath("userData");
			const data = readFileSync(`${path}/marketplaceFilters.json`, "utf8");
			const filters = JSON.parse(data);

			this.marketplaceFilters.set(filters);
			this.toastMessage = {
				message: `Filters loaded.`,
				background: "bg-surface-500",
			};
		} catch (err) {
			logger.info(`Failed to load marketplace filters: ${err}`);
		}
	}

	#savePurchaseHistory() {
		const path = app.getPath("userData");
		const data = JSON.stringify(
			this.boughtItems.value,
			(_, v) => (typeof v === "bigint" ? v.toString() : v),
			2,
		);

		writeFile(`${path}/purchaseHistory.json`, data, (err) => {
			if (err) {
				logger.info(`Failed to save purchase history: ${err}`);
			}
		});
	}

	#loadPurchaseHistory() {
		try {
			const path = app.getPath("userData");
			const data = readFileSync(`${path}/purchaseHistory.json`, "utf8");
			const history = JSON.parse(data, (key, val) =>
				key === "listingId" ? BigInt(val) : val,
			);

			this.boughtItems.set(history);
			this.toastMessage = {
				message: `Purchase History loaded.`,
				background: "bg-surface-500",
			};
		} catch (err) {
			logger.info(`Failed to load purchase history: ${err}`);
		}
	}

	@marketplace.Handle("reloadPurchaseHistory")
	async reloadPurchaseHistory() {
		this.#loadPurchaseHistory();
	}

	@marketplace.Handle("reloadMyListings")
	async reloadMyListings() {
		this.dad.client.api.marketPlace.sendMarketplaceMyItemListReq({});
	}

	@marketplace.Handle("sellItem")
	async sellItem(item: Item, price: number) {
		this.dad.client.api.marketPlace.onceMarketplaceItemRegisterRes((v) => {
			if (v.result === PacketResult.FAIL_MARKETPLACE_EXCEEDED_MAXIMUM_REGISTRATION) {
				this.toastMessage = {
					message: `Unable to list item! Maximum number of listed items reached.`,
					background: "variant-filled-error",
				};
			} else if (v.result === PacketResult.FAIL_MARKETPLACE_ITEM_PRICE_NOT_SET) {
				this.toastMessage = {
					message: `Invalid price for item!`,
					background: "variant-filled-error",
				};
			} else if (v.result === PacketResult.FAIL_MARKETPLACE_INSUFFICIENT_COMMISSION) {
				this.toastMessage = {
					message: `Insufficient gold for commision!`,
					background: "variant-filled-error",
				};
			} else if (v.result === PacketResult.SUCCESS) {
				this.toastMessage = {
					message: `${item.data.name} successfully listed for ${price}!`,
					background: "variant-filled-success",
				};
			}
		});
		this.dad.client.api.marketPlace.sendMarketplaceItemRegisterReq({
			priceInfos: [
				{
					itemId: "DesignDataItem:Id_Item_GoldCoins",
					price: price,
				},
			],
			registerInfo: {
				uniqueId: item.uid,
				itemCount: item.count,
				itemContentsCount: item.contents,
			},
		});
	}

	@marketplace.Handle("collectItem")
	async collectItem(listingId: bigint) {
		const listedItem = this.listedItems.value.find((item) => item.listingId === listingId);

		const availableContainers = await this.#getEmptyGoldContainers(listedItem.price);
		if (!availableContainers) return;

		const slotInfo: Unmessage<SMARKETPLACE_TRADE_SLOT_INFO>[] = [];
		availableContainers.forEach((container) => {
			slotInfo.push({
				inventoryId: container.item.inventory,
				itemContentsCount: container.maxVal,
				itemUniqueId: container.item.uid,
				itemCount: 0,
				itemId: container.item.id,
				slotId: container.item.slot,
			});
		});
		this.dad.client.api.marketPlace.sendMarketplaceTransferItemsReq({
			listingId: listingId,
			slotInfos: slotInfo,
		});

		this.dad.client.api.marketPlace.onceMarketplaceTransferItemsRes((v) => {
			switch (v.result) {
				case PacketResult.SUCCESS:
					{
						this.toastMessage = {
							message: `Successfully collected ${listedItem.price} gold!`,
							background: "variant-filled-success",
						};
					}
					break;
				case PacketResult.FAIL_MARKETPLACE_ITEM_DISTRIBUTION_FAILED:
					{
						this.toastMessage = {
							message: `Not enough space to collect ${listedItem.price} gold!`,
							background: "variant-filled-error",
						};
					}
					break;
			}
		});
	}

	async #getGoldContainersWithSpace() {
		let availableGoldContainers: Item[] = [];
		for await (const inventory of this.dad.client.lobby.allInventories.value) {
			inventory.items
				.filter(
					(item) =>
						item.id === "DesignDataItem:Id_Item_GoldCoinPurse" && item.contents < 10,
				)
				.forEach((item) => availableGoldContainers.push(item));

			inventory.items
				.filter(
					(item) =>
						item.id === "DesignDataItem:Id_Item_GoldCoinBag" && item.contents < 1000,
				)
				.forEach((item) => availableGoldContainers.push(item));

			inventory.items
				.filter(
					(item) =>
						item.id === "DesignDataItem:Id_Item_GoldCoinChest" && item.contents < 10000,
				)
				.forEach((item) => availableGoldContainers.push(item));
		}

		return availableGoldContainers;
	}

	async #getTotalSpaceForGold() {
		let availableGoldContainers = await this.#getGoldContainersWithSpace();

		let totalSpace = 0;
		for await (const container of availableGoldContainers) {
			switch (container.id) {
				case "DesignDataItem:Id_Item_GoldCoinPurse":
					totalSpace += 10 - container.contents;
					break;
				case "DesignDataItem:Id_Item_GoldCoinBag":
					totalSpace += 1000 - container.contents;
					break;
				case "DesignDataItem:Id_Item_GoldCoinChest":
					totalSpace += 10000 - container.contents;
					break;
			}
		}

		return totalSpace;
	}

	async #getTotalGold() {
		let availableGoldCoins: Item[] = [];
		for await (const inventory of this.dad.client.lobby.allInventories.value) {
			inventory.items
				.filter(
					(xItem) =>
						(xItem.id === "DesignDataItem:Id_Item_GoldCoinPurse" ||
							xItem.id === "DesignDataItem:Id_Item_GoldCoinBag" ||
							xItem.id === "DesignDataItem:Id_Item_GoldCoinChest") &&
						xItem.contents > 1,
				)
				.forEach((xx) => availableGoldCoins.push(xx));
		}

		let result = 0;
		for await (const goldCoins of availableGoldCoins) {
			result += goldCoins.contents;
		}
		return result;
	}

	async #getEmptyGoldContainers(reqPrice: number) {
		let possibleContainers: any[] = [];

		let availableGoldContainers = await this.#getGoldContainersWithSpace();
		let requiredPrice = reqPrice;

		for await (const chest of availableGoldContainers.filter(
			(container) => container.id === "DesignDataItem:Id_Item_GoldCoinChest",
		)) {
			const diff = requiredPrice - (10000 - chest.contents);
			if (diff <= 0) {
				possibleContainers.push({
					item: chest,
					maxVal: requiredPrice,
				});
				requiredPrice = 0;
				break;
			}

			possibleContainers.push({
				item: chest,
				maxVal: 10000 - chest.contents,
			});
			requiredPrice -= 10000 - chest.contents;
		}

		if (requiredPrice == 0) return possibleContainers;
		for await (const bag of availableGoldContainers.filter(
			(container) => container.id === "DesignDataItem:Id_Item_GoldCoinBag",
		)) {
			const diff = requiredPrice - (10000 - bag.contents);
			if (diff <= 0) {
				possibleContainers.push({
					item: bag,
					maxVal: requiredPrice,
				});
				requiredPrice = 0;
				break;
			}

			possibleContainers.push({
				item: bag,
				maxVal: 1000 - bag.contents,
			});
			requiredPrice -= 1000 - bag.contents;
		}

		if (requiredPrice == 0) return possibleContainers;
		for await (const purse of availableGoldContainers.filter(
			(container) => container.id === "DesignDataItem:Id_Item_GoldCoinPurse",
		)) {
			const diff = requiredPrice - (10000 - purse.contents);
			if (diff <= 0) {
				possibleContainers.push({
					item: purse,
					maxVal: requiredPrice,
				});
				requiredPrice = 0;
				break;
			}

			possibleContainers.push({
				item: purse,
				maxVal: 10 - purse.contents,
			});
			requiredPrice -= 10 - purse.contents;
		}

		if (requiredPrice == 0) return possibleContainers;
		return false;
	}
}
