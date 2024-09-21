import type { CONTEXT_BRIDGE } from "@electron/preload";
import { readable, type Readable, type Stores, type Unsubscriber } from "svelte/store";
import type { ActionParameters, ActionResult, ContextType, IPCContext } from "@shared/libs/ipc";
import type { PacketName, Payload } from "@dad-js/dad-api";
import { dadclient } from "@context";

declare global {
	interface Window {
		bridge: typeof CONTEXT_BRIDGE;
	}
}

console.log("----------------------");
const storeCache = {} as Record<string, Readable<any>>;

const ipc = {
	call: <C extends IPCContext<any>, K extends keyof C["keys"]>(
		context: C,
		key: K,
		...args: ActionParameters<C, K>
	): Promise<Awaited<ActionResult<C, K>>> => {
		const _ = context.get(key);
		return window.bridge.invoke(_.namespace! + ":" + _.name, ...args);
	},
	on: <C extends IPCContext<any>, K extends keyof C["keys"]>(
		context: C,
		key: K,
		handler: (v: ContextType<C, K>) => any,
	) => {
		const _ = context.get(key);
		return window.bridge.on(_.namespace! + ":" + _.name, (v) => {
			handler(v);
		});
	},

	value: <C extends IPCContext<any>, K extends keyof C["keys"]>(context: C, key: K) => {
		const _ = context.get(key);
		const name = _.namespace + ":" + _.name;
		//console.log("access ipc value", name);
		if (!storeCache[name]) {
			//console.log("creating readable for", name);
			storeCache[name] = readable<ContextType<C, K>>(_.default as any, (set, update) => {
				//console.log("subscribing to readable for", name);
				set(_.default as any);
				const onIpcValue = (v: any) => {
					//console.log("receive value for", name);
					set(v);
				};
				const unsubscriber = ipc.on(context, key, onIpcValue);
				window.bridge.send("ready", name);
				return () => {
					//console.log("unsubscribing for", name);
					unsubscriber();
				};
			});
		}
		return storeCache[name] as Readable<ContextType<C, K>>;
	},
};
export default ipc;

(window as any)["send"] = (packetName: PacketName, body: any) => {
	ipc.call(dadclient, "sendPacket", packetName, body);
};

(window as any)["move"] = (fromInv: number, fromSlot: number, toInv: number, toSlot: number) => {
	ipc.call(dadclient, "sendPacket", "C2S_INVENTORY_MOVE_REQ", {
		dstInventoryId: toInv,
		dstSlotId: toSlot,
		srcInfo: {
			inventoryId: fromInv,
			slotId: fromSlot,
			uniqueId: "",
		} as any,
	} satisfies Payload<"C2S_INVENTORY_MOVE_REQ">);

	ipc.call(dadclient, "sendPacket", "C2S_LOBBY_CHARACTER_INFO_REQ", {});
};
