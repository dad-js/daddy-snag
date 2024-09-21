import { app, ipcMain } from "electron";
import { reflect } from "typescript-rtti";
import { AppService } from "@services";
import { logger } from "./utils";

type Constructor<T = {}> = new (...args: any[]) => T;
type Instanced<T extends Constructor> = T extends new (...args: any[]) => infer R ? R : T;

class Container {
	#keys = [] as any[];
	#instances = {} as Record<any, any>;

	register(key: any, value: any) {
		this.#instances[key] = value;
		if (!this.#keys.includes(key)) {
			this.#keys.push(key);
		}
	}

	get<C extends Constructor>(key: C): Instanced<C>;
	get(key: any): any {
		return this.#instances[key];
	}

	get keys() {
		return this.#keys;
	}

	get services() {
		return this.#keys.map((k) => [k, this.#instances[k]]);
	}
}

export const container = new Container();

export function Inject<T extends {}, K extends keyof T>(target: T, key: K) {
	Object.defineProperty(target, key, {
		set: (newValue: string) => {},
		get: () => {
			return container.get(
				reflect(target)
					.getProperty(key as any)
					.type.as("class").class,
			);
		},
	});
}

let isReady = false;
const servicesToStart: Constructor[] = [];

export function Service<C extends Constructor>(target: C) {
	if (isReady) {
		createService(target);
		startService(target);
	} else {
		servicesToStart.push(target);
	}
}

app.on("ready", async () => {
	isReady = true;
	for (const service of servicesToStart) {
		createService(service);
	}
	for (const service of servicesToStart) {
		await startService(service);
	}
});

ipcMain.on("ready", (_, _name?: string) => {
	for (const [service, instance] of container.services) {
		const ipcValues = Reflect.getOwnMetadata("ipc-values", service);
		for (const name in ipcValues ?? []) {
			if (!_name || name === _name) {
				ipcValues[name].onSet?.(ipcValues[name].value);
			}
		}
	}
});

function createService(service: Constructor) {
	const instance = new service();
	container.register(service, instance);

	const ipcValues = Reflect.getOwnMetadata("ipc-values", service);
	if (ipcValues) {
		for (const name in ipcValues) {
			if (!ipcValues[name].onSet) {
				ipcValues[name].onSet = (v: any) => {
					container.get(AppService).mainWindow.webContents.send(name, v);
				};
			}
		}
	}

	const ipcActions = Reflect.getOwnMetadata("ipc-actions", service);
	if (ipcActions) {
		for (const name in ipcActions) {
			ipcMain.handle(name, (e, ...args: any[]) => ipcActions[name].call(instance, ...args));
		}
	}
}

async function startService(service: Constructor) {
	const instance = container.get(service) as any;
	if (typeof instance["onStart"] === "function") {
		await instance["onStart"].call(instance);
	}
}
