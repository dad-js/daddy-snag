import { action, IPCContext, value } from "@shared/libs/ipc";

export const game = new IPCContext(
	{
		isRunning: value<boolean>({ default: false }),
		launch: action<[], void>(),
		kill: action<[], void>(),
	},
	{ namespace: "game" },
);
