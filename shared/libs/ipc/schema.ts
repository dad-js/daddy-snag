export function value<T>(opts: Omit<IPCType<T>, "kind"> = {}): IPCType<T> & { kind: "value" } {
	return { ...opts, kind: "value" };
}

export function action<P extends any[], R>(
	opts: Omit<IPCAction<P, R>, "kind"> = {},
): IPCAction<P, R> {
	return { ...opts, kind: "action" };
}

export type IPCSchema = Record<string, IPCType<any>>;

export type IPCAction<P extends any[], R> = IPCType<(...params: P) => Promise<R>> & {
	kind: "action";
};

export interface IPCType<T> {
	kind: "value" | "action";
	default?: T;
	//mutable?: boolean;
	//debug?: boolean;
}
