import { ui, UIStatus, game, type ToastOption } from "@context";
import { Store } from "@dad-js/dad.js";
import { Inject, Service } from "@electron/libs/di";

import { logger, sleep } from "@electron/libs/utils";
import { app } from "electron";
import semver from "semver";
import axios from "axios";
import { createWriteStream, renameSync } from "original-fs";
import { spawn } from "child_process";

export interface GithubRelease {
	id: number;
	url: string;
	tag_name: string;
	name: string;
	body: string;
	draft: boolean;
	prerelease: boolean;
	created_at: string;
	published_at: string;
	assets: GithubReleaseAsset[];
}

export interface GithubReleaseAsset {
	id: number;
	name: string;
	url: string;
	content_type: string;
	size: number;
	created_at: string;
	updated_at: string;
	browser_download_url: string;
}

@Service
export class UpdateService {
	@ui.Expose("status") status!: UIStatus;
	@ui.Expose("statusText") statusText!: string;
	@ui.Expose("toastMessage") toastMessage!: ToastOption;

	#currentVersion: string = app.getVersion();

	constructor() {}

	async onStart() {
		logger.info(`Starting update service `);
	}

	async checkForUpdates() {
		logger.info(`Current Version: ${this.#currentVersion}`);

		if (!app.isPackaged) {
			logger.info(`Running in development - Skipping Update!`);
			return;
		}
		this.status = "checkingForUpdates";
		this.statusText = UIStatus.checkingForUpdates();

		const releases = await this.getReleases();
		const latest = this.getLatest(releases);

		if (latest) {
			const hasNewVersion = semver.gt(
				latest?.tag_name ?? this.#currentVersion,
				this.#currentVersion,
			);
			logger.info(`Latest Version: ${latest.tag_name}`);
			if (hasNewVersion) {
				this.status = "downloadUpdate";
				this.statusText = UIStatus.downloadUpdate();

				await this.downloadUpdate(latest);
			} else {
				logger.info(`No update available!`);
			}
		}
	}

	async downloadUpdate(latest: GithubRelease) {
		logger.info(`Downloading Update`);
		const downloadUrl = latest.assets[0].browser_download_url;
		const savePath = `${process.env.PORTABLE_EXECUTABLE_DIR}\\${latest.assets[0].name}`;

		await this.downloadFile(downloadUrl, savePath);

		const spawnedProcess = spawn(savePath, {
			detached: true,
		});
		spawnedProcess.unref();
		app.quit();
	}

	async downloadFile(fileUrl: string, outputLocationPath: string) {
		const writer = createWriteStream(outputLocationPath);

		return axios({
			method: "get",
			url: fileUrl,
			responseType: "stream",
		}).then((response) => {
			return new Promise((resolve, reject) => {
				response.data.pipe(writer);
				let error: any = null;
				writer.on("error", (err) => {
					error = err;
					writer.close();
					reject(err);
				});
				writer.on("close", () => {
					if (!error) {
						resolve(true);
					}
				});
			});
		});
	}

	async getReleases(): Promise<GithubRelease[]> {
		const response = await axios.get(`https://api.github.com/repos/dad-js/daddy-snag/releases`);

		if (response.status !== 200) {
			throw new Error(response.statusText);
		}

		return response.data as GithubRelease[];
	}

	getLatest(
		releases: GithubRelease[],
		filterRelease: (release: GithubRelease) => boolean = () => true,
		filterAsset: (release: GithubReleaseAsset) => boolean = () => true,
	): GithubRelease | null {
		if (!releases) {
			return null;
		}

		const filtered = releases.filter(filterRelease);

		if (!filtered.length) {
			return null;
		}

		for (const release of filtered) {
			const assets = release.assets.filter(filterAsset);

			if (assets.length) {
				return Object.assign({}, release, { assets });
			}
		}

		return null;
	}
}
