import { Inject, Service } from "@electron/libs/di";
import { logger } from "@electron/libs/utils";
import { GameService } from "@services";
import { dadclient, MAX_PACKET_HISTORY, ui, UIStatus } from "@context";
import { Client, Store } from "@dad-js/dad.js";
import { type CharacterInfo, type DirectionalPacket } from "@dad-js/dad.js";
import { decode, encode, type AccountLoginRes, type PacketName } from "@dad-js/dad-api";

@Service
export class DaDClientService {
	@Inject game!: GameService;

	client!: Client;

	@ui.Expose("status") status!: UIStatus;
	@ui.Expose("statusText") statusText!: string;

	@dadclient.Expose("isConnected") isConnected!: boolean;
	@dadclient.Expose("lastPacket") lastPacket?: DirectionalPacket;

	@dadclient.Store("packetLog") packetLog = new Store<DirectionalPacket[]>();
	@dadclient.Store("accountInfo") accountInfo!: Store<AccountLoginRes>;
	@dadclient.Store("characterList") characterList!: Store<CharacterInfo[]>;
	@dadclient.Store("selectedCharacter") selectedCharacter!: Store<CharacterInfo | undefined>;

	async onStart() {
		logger.info("Starting DaD client service ");

		this.status = "connectingDarkAndDarker";
		this.statusText = UIStatus.connectingDarkAndDarker();

		this.client = await Client.create({
			port: 3000,
			sessionTicket: this.game.info.authSessionTicket,
		});
		this.game.serverPort = this.client.options.port;
		this.#addListeners();

		this.status = "loggingInDarkAndDarker";
		this.statusText = UIStatus.loggingInDarkAndDarker();
		await this.client.login();

		this.status = "selectCharacter";
		this.statusText = UIStatus.selectCharacter();

		this.accountInfo = this.client.accountInfo;
		this.characterList = this.client.characterList;
		this.selectedCharacter = this.client.selectedCharacter;
	}

	#addListeners() {
		this.client.selectedCharacter.subscribe((v) => {
			if (v === undefined) {
				this.status = "selectCharacter";
				this.statusText = UIStatus.selectCharacter();
			} else {
				this.status = "ready";
				this.statusText = UIStatus.ready();
			}
		});

		this.client.networker.onServerToGame = async (
			packetName: PacketName,
			payload: Uint8Array,
		) => {
			this.logPacket({
				direction: "IN",
				name: packetName,
				data: decode(packetName, payload),
			});
			return payload;
		};

		this.client.networker.onGameToServer = async (
			packetName: PacketName,
			payload: Uint8Array,
		) => {
			this.logPacket({
				direction: "OUT",
				name: packetName,
				data: decode(packetName, payload),
			});
			return payload;
		};
	}

	logPacket(packet: DirectionalPacket) {
		this.lastPacket = packet;
		this.packetLog.update((log) => {
			if (log.length > MAX_PACKET_HISTORY) {
				log.shift();
			}
			log.push(packet);
			return log;
		});
	}

	@dadclient.Handle("selectCharacter")
	async selectCharacter(id: string) {
		const char = this.characterList.value.find((c) => c.id === id);
		this.client.selectCharacter(char!);
	}

	@dadclient.Handle("sendPacket")
	async sendPacket(name: PacketName, payload: any) {
		this.client.networker.client.send(name, encode(name, payload));
	}
}
