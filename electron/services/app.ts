import { ui, type ToastOption, type UIStatus } from "@context";
import { Inject, Service } from "@electron/libs/di";

import { logger, sleep } from "@electron/libs/utils";
import { app, BrowserWindow } from "electron";
import electronReload from "electron-reload";
import { join } from "path";
import { MarketplaceService } from "./dad";

@Service
export class AppService {
	mainWindow!: BrowserWindow;

	@ui.Expose("status") status!: UIStatus;
	@ui.Expose("statusText") statusText!: string;
	@ui.Expose("toastMessage") toastMessage!: ToastOption;

	constructor() {
		logger.info(`Starting app service `);
		app.once("window-all-closed", () => app.quit());

		this.mainWindow = new BrowserWindow({
			width: 1200,
			height: 800,
			resizable: true,
			show: false,
			frame: true,
			transparent: false,
			alwaysOnTop: false,
			titleBarStyle: "hidden",
			autoHideMenuBar: true,
			icon: join(__dirname, "../../../renderer/assets/logo.png"),
			webPreferences: {
				devTools: true || !app.isPackaged,
				preload: join(__dirname, "../preload.js"),
				nodeIntegration: false,
				nodeIntegrationInSubFrames: false,
			},
		});

		this.mainWindow.once("ready-to-show", this.mainWindow.show);
		//this.mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
		//this.mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
	}

	async onStart() {
		if (app.isPackaged) {
			await this.mainWindow.loadFile(join(__dirname, "../../renderer/index.html"));
		} else {
			electronReload(join(__dirname, "../.."), {
				forceHardReset: true,
				hardResetMethod: "quit",
				electron: app.getPath("exe"),
			});

			await this.mainWindow.loadURL(`http://localhost:5173/`);
		}
	}

	@ui.Handle("closeApp") async closeApp() {
		app.quit();
	}

	@ui.Handle("minimizeApp") async minimizeApp() {
		this.mainWindow.minimize();
	}

	@ui.Handle("maximizeApp") async maximizeApp() {
		if (this.mainWindow.isMaximized()) {
			this.mainWindow.unmaximize();
		} else {
			this.mainWindow.maximize();
		}
	}

	@ui.Handle("setStatus") async setStatus(status: UIStatus, text: string) {
		this.status = status;
		this.statusText = text;
	}

	@ui.Handle("addToastMessage") async addToastMessage(message: string, background?: string) {
		this.toastMessage = {
			message: message,
			background,
		};
	}
}
