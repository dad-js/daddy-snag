import type { Readable, Store, Unsubscriber } from "@dad-js/dad.js";
import { ContextType, IPCKeys, type ResolveIPCType } from "./keys";
import { IPCSchema } from "./schema";

export interface IPCContextOptions {
	namespace?: string;
}

export class IPCContext<S extends IPCSchema> {
	public keys: IPCKeys<S>;
	public static uid = 0;

	constructor(schema: S, opts?: IPCContextOptions) {
		this.keys = Object.entries(schema)
			.map(([key, value]) => ({
				name: key,
				namespace: opts?.namespace ?? `$${IPCContext.uid++}`,
				default: value.default,
				//mutable: value.mutable,
				//debug: value.debug,
				kind: value.kind,
				config: this,
			}))
			.reduce(
				(a, b) => ({
					...a,
					[b.name]: b,
				}),
				{} as IPCKeys<S>,
			);
	}

	get<K extends keyof IPCKeys<S>>(key: K): IPCKeys<S>[K] {
		return this.keys[key];
	}

	Handle<K extends keyof IPCKeys<S>>(key: K) {
		const _ = this.get(key);
		const name = _.namespace! + ":" + _.name;

		return <_K extends string, T extends { [key in _K]: ResolveIPCType<S, K> }>(
			target: T,
			k: _K,
			descriptor: PropertyDescriptor,
		): PropertyDescriptor => {
			if (!Reflect) return descriptor;
			if (!Reflect.hasOwnMetadata("ipc-actions", target.constructor)) {
				Reflect.defineMetadata("ipc-actions", {}, target.constructor);
			}
			const ipcActions = Reflect.getOwnMetadata("ipc-actions", target.constructor);
			ipcActions[name] = descriptor.value;
			return descriptor;
		};
	}

	#values = {} as Record<
		string,
		{
			value: any;
			onSet?: (v: any) => void;
			store?: Store<any>;
			unsubscriber?: Unsubscriber;
		}
	>;
	Expose<K extends keyof IPCKeys<S>>(key: K) {
		const _ = this.get(key);
		const name = _.namespace! + ":" + _.name;
		if (!this.#values[name]) {
			this.#values[name] = {
				value: _.default,
			};
		}

		return <_K extends string, T extends { [key in _K]?: ResolveIPCType<S, K> }>(
			target: T,
			k: _K,
		) => {
			if (Reflect) {
				if (!Reflect.hasOwnMetadata("ipc-values", target.constructor)) {
					Reflect.defineMetadata("ipc-values", {}, target.constructor);
				}
				const ipcValues = Reflect.getOwnMetadata("ipc-values", target.constructor);
				ipcValues[name] = this.#values[name];
			}

			Object.defineProperty(target, k, {
				set: (v: T) => {
					this.#values[name].value = v;
					this.#values[name].onSet?.(v);
				},
				get: () => this.#values[name].value,
			});
		};
	}

	Store<K extends keyof IPCKeys<S>>(key: K) {
		const _ = this.get(key);
		const name = _.namespace! + ":" + _.name;
		if (!this.#values[name]) {
			this.#values[name] = {
				value: _.default,
			};
		}

		return <
			_K extends string,
			T extends { [key in _K]?: Readable<ResolveIPCType<S, K> | undefined> },
		>(
			target: T,
			k: _K,
		) => {
			if (Reflect) {
				if (!Reflect.hasOwnMetadata("ipc-values", target.constructor)) {
					Reflect.defineMetadata("ipc-values", {}, target.constructor);
				}
				const ipcValues = Reflect.getOwnMetadata("ipc-values", target.constructor);
				ipcValues[name] = this.#values[name];
			}

			Object.defineProperty(target, k, {
				set: (store: Store<ResolveIPCType<S, K>>) => {
					this.#values[name].unsubscriber?.();
					this.#values[name].store = store;
					store?.set(store.value || this.#values[name].value);
					store?.subscribe((v) => {
						this.#values[name].value = v;
						this.#values[name].onSet?.(v);
					});
				},
				get: () => this.#values[name].store,
			});
		};
	}
}

export type ActionParameters<C extends IPCContext<any>, K extends keyof C["keys"]> =
	ContextType<C, K> extends (...args: infer P) => any ? P : never;

export type ActionResult<C extends IPCContext<any>, K extends keyof C["keys"]> =
	ContextType<C, K> extends (...args: any[]) => infer R ? R : never;
