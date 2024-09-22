import { game, steam, ui, UIStatus } from "@context";
import { Inject, Service } from "@electron/libs/di";
import { logger, sleep } from "@electron/libs/utils";
import { spawn, exec } from "child_process";
import { utilityProcess } from "electron";
import { getGamePath } from "steam-game-path";
import { join } from "path";
import { app } from "electron";
import { UpdateService } from "./update";

@Service
export class GameService {
	@Inject updateService!: UpdateService;

	readonly tavern = "Tavern.exe";
	readonly dungeonCrawler = "DungeonCrawler.exe";
	readonly appId = 2016590;

	serverPort = 3000;

	@steam.Expose("info") info!: any;
	@game.Expose("isRunning") isRunning!: boolean;
	@ui.Expose("status") status!: UIStatus;
	@ui.Expose("statusText") statusText!: string;

	async onStart() {
		logger.info(`Starting game service`);
		await this.updateService.checkForUpdates();
		await sleep(5000);

		this.status = "lookingForDarkAndDarker";
		this.statusText = UIStatus.lookingForDarkAndDarker();
		this.isRunning = await this.checkIsRunning();

		await sleep(1000);
		if (this.isRunning) {
			this.status = "gameAlreadyRunning";
			this.statusText = UIStatus.gameAlreadyRunning();
		}

		this.startIsRunningCheck();
		while (this.isRunning) {
			await sleep(1000);
		}

		this.status = "connectingSteam";
		this.statusText = UIStatus.connectingSteam();

		await new Promise<void>((res) => {
			const child = utilityProcess.fork(join(__dirname, "../workers/steamworks.js"));
			child.on("message", (msg) => {
				this.info = msg;
				res();
			});
			child.postMessage(this.appId);
		});
	}

	@game.Handle("launch")
	async launchGame() {
		const serverArg = `-server=http://127.0.0.1:${this.serverPort}`;
		const gameFolder = `${getGamePath(this.appId)?.game?.path}`;

		try {
			const spawnedProcess = spawn(`${gameFolder}\\${this.tavern}`, [
				"-steam=1",
				"-taverntype=steam",
				"-tavernapp=dad",
				serverArg,
			]);
			spawnedProcess.unref();
		} catch (err) {
			console.log(err);
			return;
		}

		this.isRunning = true;
		this.startIsRunningCheck();
	}

	@game.Handle("kill")
	async killGame() {
		logger.info("Stopping game");
		exec(`taskkill /IM ${this.tavern} /F`);
		exec(`taskkill /IM ${this.dungeonCrawler} /F`);
		this.isRunning = false;
		this.startIsRunningCheck();
	}

	#isRunningTimer?: any;
	startIsRunningCheck() {
		clearInterval(this.#isRunningTimer);
		this.#isRunningTimer = setInterval(async () => {
			this.isRunning = await this.checkIsRunning();
		}, 5000);
	}

	checkIsRunning() {
		return new Promise<boolean>((res) => {
			exec("tasklist", (err, stdout, stderr) => {
				res(stdout.toLowerCase().indexOf(this.tavern.toLowerCase()) > -1);
			});
		});
	}
}
