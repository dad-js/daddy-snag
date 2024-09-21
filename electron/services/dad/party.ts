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
import { party, ui, type ToastOption } from "@context";

import { Store } from "@dad-js/dad.js";
import { PacketResult, PARTY_INVITE_ANSWER } from "@dad-js/dad-api/pb";
import type { PartyInviteNot } from "@dad-js/dad-api";
import moment from "moment";

@Service
export class PartyService {
	@Inject dad!: DaDClientService;

	@ui.Expose("toastMessage") toastMessage!: ToastOption;
	@party.Expose("newPartyInvite") newPartyInvite!: PartyInviteNot;

	@party.Store("autoDecline") autoDecline: Store<boolean> = new Store(false);
	@party.Store("autoAccept") autoAccept: Store<boolean> = new Store(false);

	async onStart() {
		logger.info("Starting DaD Party service  ");

		this.#addListeners();
	}

	#addListeners() {
		this.dad.client.api.party.onPartyInviteNot((e) => this.#handlePartyInvite(e));
	}

	async #handlePartyInvite(payload: PartyInviteNot) {
		logger.info(
			`New Party Invite : ${JSON.stringify(payload, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`,
		);

		if (this.autoDecline.value) {
			this.dad.client.api.party.sendPartyInviteAnswerReq({
				inviteResult: PARTY_INVITE_ANSWER.INVITE_ANSWER_CANCEL,
				returnAccountId: payload.InviteeAccountId,
			});
		} else if (this.autoAccept.value) {
			this.dad.client.api.party.sendPartyInviteAnswerReq({
				inviteResult: PARTY_INVITE_ANSWER.INVITE_ANSWER_ACEEPT,
				returnAccountId: payload.InviteeAccountId,
			});
		}

		this.newPartyInvite = payload;
		this.toastMessage = {
			message: `New Party Invite from ${payload.InviteeNickName?.originalNickName}`,
		};
	}

	@party.Handle("setAutoAccept")
	async setAutoAccept(value: boolean) {
		this.autoAccept.set(value);
	}

	@party.Handle("setAutoDecline")
	async setAutoDecline(value: boolean) {
		this.autoDecline.set(value);
	}

	@party.Handle("sendPartyInvite")
	async sendPartyInvite(accountId: string) {}
}
