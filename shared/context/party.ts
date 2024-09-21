import type { PartyInviteNot } from "@dad-js/dad-api";
import { action, IPCContext, value } from "@shared/libs/ipc";

export const party = new IPCContext(
	{
		newPartyInvite: value<PartyInviteNot>({
			default: undefined,
		}),
		autoDecline: value<boolean>({ default: false }),
		setAutoDecline: action<[boolean], void>(),

		autoAccept: value<boolean>({ default: false }),
		setAutoAccept: action<[boolean], void>(),

		sendPartyInvite: action<[string], void>(),
		declinePartyInvite: action<[string], void>(),
		acceptPartyInvite: action<[string], void>(),
	},
	{ namespace: "party" },
);
