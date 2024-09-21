import { lobby } from "@context/lobby";
import type { Inventory, ItemPosition, Readable, Store } from "@dad-js/dad.js";
import { Inject, Service } from "@electron/libs/di";
import { logger } from "@electron/libs/utils";
import { DaDClientService } from "@services";

@Service
export class LobbyService {
	@Inject dad!: DaDClientService;

	@lobby.Store("equipment") equipment!: Readable<Inventory>;
	@lobby.Store("inventory") inventory!: Readable<Inventory>;
	@lobby.Store("stash") stash!: Readable<Inventory[]>;

	async onStart() {
		logger.info("Starting DaD lobby service  ");
		await this.dad.selectedCharacter.changed;

		this.equipment = this.dad.client.lobby.equipment;
		this.inventory = this.dad.client.lobby.inventory;
		this.stash = this.dad.client.lobby.stash;
		this.#addListeners();
	}

	#addListeners() {}

	@lobby.Handle("moveItem")
	async moveItem(from: ItemPosition, to: Omit<ItemPosition, "uid">) {
		await this.dad.client.lobby.moveItem(from, to);
	}
}
