import type { Unmessage } from "@dad-js/dad-api";
import type {
	MARKETPLACE_FILTER,
	SC2S_MARKETPLACE_ITEM_LIST_REQ,
	SMARKETPLACE_FILTER_INFO,
} from "@dad-js/dad-api/pb";

export type CombinedFilter = Unmessage<SMARKETPLACE_FILTER_INFO>[] | Record<string, any>;
export default class MarketplaceFilter {
	#filters: Unmessage<SMARKETPLACE_FILTER_INFO>[] = [];
	#customFilters: Record<string, any> = {};

	addFilter(filterType: MARKETPLACE_FILTER, filters: string[]): void {
		const existingFilterIndex = this.#filters.findIndex(
			(filterInfo) => filterInfo.filterType === filterType,
		);

		if (existingFilterIndex !== -1) {
			this.#filters[existingFilterIndex].filters = filters;
		} else {
			this.#filters.push({ filterType, filters });
		}
	}

	removeFilter(filterType: MARKETPLACE_FILTER): void {
		this.#filters = this.#filters.filter((filterInfo) => filterInfo.filterType !== filterType);
	}

	addCustomFilter(key: string, value: any): void {
		this.#customFilters[key] = value;
	}

	removeCustomFilter(key: string): void {
		delete this.#customFilters[key];
	}

	getFilters(): Unmessage<SMARKETPLACE_FILTER_INFO>[] {
		return this.#filters;
	}

	getCustomFilters(): Record<string, any> {
		return this.#customFilters;
	}

	generateRequest(
		sortType: number,
		sortMethod: number,
		currentPage: number,
	): Unmessage<SC2S_MARKETPLACE_ITEM_LIST_REQ> {
		return {
			filterInfos: this.#filters,
			sortType,
			sortMethod,
			currentPage,
		};
	}
}
