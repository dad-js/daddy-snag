import steamworks from "steamworks.js";

export interface SteamworksData {
	steamId64: bigint;
	username: string;
	authSessionTicket: string;
}

process.parentPort.once("message", async (e) => {
	const client = steamworks.init(e.data);
	const steamId64 = client.localplayer.getSteamId().steamId64;
	const username = client.localplayer.getName();
	const authSessionTicket = (await client.auth.getSessionTicketWithSteamId(steamId64))
		.getBytes()
		.toString("hex")
		.toUpperCase();

	process.parentPort.postMessage({
		steamId64,
		username,
		authSessionTicket,
	});

	process.exit();
});
