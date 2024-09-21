import { app } from "electron";
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
	type WriteStream,
} from "original-fs";

import { Inject, Service } from "@electron/libs/di";
import { logger } from "@electron/libs/utils";
import { DaDClientService } from "@services";
import {
	chat,
	ui,
	type Conversation,
	type CustomMessageString,
	type ToastOption,
	type WhisperMessage,
} from "@context";

import { Store } from "@dad-js/dad.js";
import { PacketResult, type SCHATDATA, type SCHATDATA_PIECE } from "@dad-js/dad-api/pb";
import type { Unmessage, WhisperChatNot } from "@dad-js/dad-api";
import moment from "moment";

@Service
export class ChatService {
	@Inject dad!: DaDClientService;

	@ui.Expose("toastMessage") toastMessage!: ToastOption;
	@chat.Store("whisperMessages") whisperMessages: Store<WhisperMessage[]> = new Store([]);
	@chat.Store("targetNickname") targetNickname: Store<string> = new Store("");

	@chat.Store("listOfConversations") listOfConversations: Store<Conversation[]> = new Store([]);
	@chat.Store("savedMessages") savedMessages: Store<CustomMessageString[][]> = new Store([]);

	#saveFS: WriteStream | null = null;

	#bufferedMessages: WhisperMessage[] = [];

	async onStart() {
		logger.info("Starting DaD Chat service  ");

		this.#addListeners();
		this.loadListofConversations();
		this.#loadSavedMessages();
	}

	#addListeners() {
		this.dad.client.api.common.onWhisperChatNot((e) => this.#handleWhisperChatRes(e));

		this.dad.client.api.common.onWhisperChatRes((data) => {
			switch (data.result) {
				case PacketResult.FAIL_CHAT_WHISPER_NOT_FOUND_USER:
					{
						this.toastMessage = {
							message: `User doesnt seem to be online!`,
							background: "bg-surface-500",
						};
					}
					break;
			}
		});

		const testWhisper = () =>
			setInterval(() => {
				this.#handleWhisperChatRes({
					chatData: {
						accountId: "12345",
						characterId: "54321",
						nickname: {
							originalNickName: "Test",
							fame: 0,
							karmaRating: 0,
							rankId: "0",
							streamingModeNickName: "",
						},
						partyId: "",
						chatDataPieceArray: [
							{
								chatDataPieceItem: undefined,
								chatStr: "Yooooooooooo, alles fresh?",
							},
						],
					},
					time: BigInt(0),
				});
			}, 30000);
	}

	async #handleWhisperChatRes(payload: WhisperChatNot) {
		logger.info(
			`Whisper chat : ${JSON.stringify(payload, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`,
		);

		if (this.targetNickname.value === payload.chatData?.nickname?.originalNickName) {
			this.#updateWhisperMessages(
				payload.chatData?.nickname?.originalNickName ?? "<Unknown>",
				payload.chatData!,
			);
		} else {
			this.toastMessage = {
				message: `New whisper message from ${payload.chatData?.nickname?.originalNickName}`,
				background: "bg-surface-500",
			};

			this.#bufferedMessages.push({
				chatData: payload.chatData!,
				targetNickName: payload.chatData?.nickname?.originalNickName ?? "",
				timestamp: moment().format(),
			});

			const conversationEntry = this.listOfConversations.value.find(
				(c) => c.name === payload.chatData?.nickname?.originalNickName ?? "",
			);

			this.listOfConversations.set([
				...this.listOfConversations.value.filter(
					(c) => c.name !== payload.chatData?.nickname?.originalNickName ?? "",
				),
				{
					name: payload.chatData?.nickname?.originalNickName ?? "",
					newMessageCount: conversationEntry ? conversationEntry.newMessageCount + 1 : 1,
					updateTimestamp: moment().format(),
				},
			]);

			logger.info(this.listOfConversations.value);
		}
	}

	async loadListofConversations() {
		const path = app.getPath("userData");

		try {
			const data = readFileSync(`${path}/chatHistory.json`, "utf8");

			const history = JSON.parse(data);
			this.listOfConversations.set(history);
		} catch (err) {
			logger.info(`Failed to load conversation history: ${err}`);
			this.listOfConversations.set([]);
		}
	}

	async saveListofConversations() {
		const path = app.getPath("userData");

		try {
			const data = JSON.stringify(this.listOfConversations.value);
			writeFileSync(`${path}/chatHistory.json`, data);
		} catch (err) {
			logger.info(`Failed to write conversation list: ${err}`);
		}
	}

	@chat.Handle("setTargetNickname")
	async setTargetNickname(targetName: string) {
		if (
			!this.listOfConversations.value.some((conversation) => conversation.name === targetName)
		) {
			this.listOfConversations.set([
				...this.listOfConversations.value,
				{ name: targetName, newMessageCount: 0, updateTimestamp: moment().format() },
			]);
		}

		this.targetNickname.set(targetName);
		this.saveListofConversations();
	}

	@chat.Handle("loadBufferedMessages")
	async loadBufferedMessages() {
		if (this.#bufferedMessages.length > 0) {
			this.#bufferedMessages.forEach((message, index) => {
				if (message.targetNickName === this.targetNickname.value) {
					this.#updateWhisperMessages(
						this.targetNickname.value,
						message.chatData!,
						undefined,
						message.timestamp,
					);
					this.#bufferedMessages.splice(index, 1); // Remove the message from buffered messages
				}
			});
		}
	}

	@chat.Handle("saveMessage")
	async saveMessage(messageParts: CustomMessageString[]) {
		this.savedMessages.set([...this.savedMessages.value, messageParts]);
		this.#saveMessages();
	}

	@chat.Handle("deleteMessage")
	async deleteMessage(index: number) {
		this.savedMessages.set([
			...this.savedMessages.value.slice(0, index),
			...this.savedMessages.value.slice(index + 1),
		]);
		this.#saveMessages();
	}

	#saveMessages() {
		const path = app.getPath("userData");

		try {
			const data = JSON.stringify(this.savedMessages.value);
			writeFileSync(`${path}/savedMessages.json`, data);
		} catch (err) {
			logger.info(`Failed to write saved messages: ${err}`);
		}
	}

	async #loadSavedMessages() {
		const path = app.getPath("userData");

		try {
			const data = readFileSync(`${path}/savedMessages.json`, "utf8");

			const history = JSON.parse(data);
			this.savedMessages.set(history);
		} catch (err) {
			logger.info(`Failed to load saved Messages: ${err}`);
			this.savedMessages.set([]);
		}
	}

	@chat.Handle("sendWhisperMessage")
	async sendWhisperMessage(targetNickName: string, chatDataPiece: Unmessage<SCHATDATA_PIECE>[]) {
		const tmpChatData: Unmessage<SCHATDATA> = {
			accountId: "",
			nickname: {
				originalNickName: "",
				streamingModeNickName: "",
				karmaRating: 0,
				rankId: "",
				fame: 0,
			},
			characterId: "",
			partyId: "",
			chatDataPieceArray: chatDataPiece,
		};

		logger.info(
			JSON.stringify(
				{
					chatData: tmpChatData,
					targetNickname: targetNickName,
				},
				(_, v) => (typeof v === "bigint" ? v.toString() : v),
			),
		);

		this.dad.client.api.common.sendWhisperChatReq({
			chatData: tmpChatData,
			targetNickname: targetNickName,
		});
		this.#updateWhisperMessages(
			this.dad.selectedCharacter.value?.name ?? "You-",
			tmpChatData,
			targetNickName,
		);
	}

	@chat.Handle("deleteConversation")
	async deleteConversation(targetName: string) {
		this.listOfConversations.set(
			this.listOfConversations.value.filter(
				(conversation) => conversation.name !== targetName,
			),
		);
		this.saveListofConversations();
	}

	async #updateWhisperMessages(
		targetNickName: string,
		tmpChatData: Unmessage<SCHATDATA>,
		overrideName?: string,
		timestamp?: string,
	) {
		this.whisperMessages.set([
			...this.whisperMessages.value,
			{
				targetNickName: targetNickName,
				chatData: tmpChatData,
				timestamp: timestamp ? timestamp : moment().format(),
			},
		]);

		const conversationEntry = this.listOfConversations.value.find(
			(c) => c.name !== (overrideName ? overrideName : targetNickName),
		);

		this.listOfConversations.set([
			...this.listOfConversations.value.filter(
				(c) => c.name !== (overrideName ? overrideName : targetNickName),
			),
			{
				name: overrideName ? overrideName : targetNickName,
				newMessageCount: conversationEntry?.newMessageCount ?? 0 + 1,
				updateTimestamp: moment().format(),
			},
		]);

		this.#saveFS?.write(
			`${JSON.stringify(
				{
					targetNickName: targetNickName,
					chatData: tmpChatData,
				},
				(_, v) => (typeof v === "bigint" ? v.toString() : v),
				2,
			)},\n`,
		);
	}

	@chat.Handle("loadChatHistory")
	async loadChatHistory() {
		if (this.targetNickname.value === "") return;

		const path = app.getPath("userData");
		if (!existsSync(`${path}/chat`)) {
			mkdirSync(`${path}/chat`);
		}
		try {
			const data = readFileSync(`${path}/chat/${this.targetNickname.value}.json`, "utf8");

			const history = JSON.parse(`[${data.substring(0, data.length - 2)}]`, (key, val) =>
				key === "time" ? BigInt(val) : val,
			);
			this.whisperMessages.set(history);
		} catch (err) {
			logger.info(`Failed to load chat history: ${err}`);
			this.whisperMessages.set([]);
		}

		if (this.#saveFS) {
			this.#saveFS.end();
			this.#saveFS.close();
		}

		this.#saveFS = createWriteStream(`${path}/chat/${this.targetNickname.value}.json`, {
			flags: "a+",
		});
	}
}
