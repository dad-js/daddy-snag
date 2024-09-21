import type { SteamworksData } from "@workers/steamworks";
import { action, IPCContext, value } from "@shared/libs/ipc";

export const UIStatus = {
	loading: () => "Loading...",
	lookingForSteam: () => `Looking for Steam...`,
	lookingForDarkAndDarker: () => `Looking for Dark and Darker...`,
	gameAlreadyRunning: () => `Game is already running!`,
	connectingSteam: () => "Connecting with steam...",
	connectingDarkAndDarker: () => "Connecting to Dark and Darker...",
	loggingInDarkAndDarker: () => "Logging into Dark and Darker...",
	selectCharacter: () => "Select Character",
	ready: () => "Ready!",
};

export type UIStatus = keyof typeof UIStatus;

export interface ToastOption {
	message: string;
	background?: string;
}

export const ui = new IPCContext(
	{
		setStatus: action<[UIStatus, string], void>(),
		toastMessage: value<ToastOption>({
			default: { message: "", background: "bg-surface-500" },
		}),
		addToastMessage: action<[string], void>(),
		status: value<UIStatus>({ default: "loading" }),
		statusText: value<string>({ default: UIStatus.loading() }),
		minimizeApp: action<[], void>(),
		maximizeApp: action<[], void>(),
		closeApp: action<[], void>(),
	},
	{ namespace: "ui" },
);
