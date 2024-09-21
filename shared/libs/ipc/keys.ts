import { IPCSchema, IPCType } from "./schema";
import { IPCContext, IPCContextOptions } from "./context";

export type IPCKeys<T extends IPCSchema> = {
	[K in keyof T]: IPCKey<ResolveIPCType<T, K>, IPCContext<T>>;
};

export interface IPCKey<T, C extends IPCContext<any>> extends IPCContextOptions, IPCType<T> {
	name: string;
	config: C;
}

export type ResolveIPCType<T extends IPCSchema, K extends keyof T> =
	T[K] extends IPCType<infer R> ? R : never;

export type ContextType<T extends IPCContext<any>, K extends keyof T["keys"]> = ResolveIPCKey<
	T["keys"][K],
	T
>;
export type ResolveIPCKey<K, C extends IPCContext<any>> = K extends IPCKey<infer T, C> ? T : never;
