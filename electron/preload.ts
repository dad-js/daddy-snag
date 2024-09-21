import { contextBridge, ipcRenderer } from "electron";

export const CONTEXT_BRIDGE = {
	invoke: (channel: string, ...args: any[]) => {
		//console.log("invoking", channel, ...args);
		return ipcRenderer.invoke(channel, ...args);
	},
	send: (channel: string, ...args: any[]) => {
		//console.log("sending", channel, ...args);
		return ipcRenderer.send(channel, ...args);
	},
	on: (channel: string, handler: (v: any) => any) => {
		//console.log("listening on ", channel);
		const cb = (_: any, v: any) => {
			handler(v);
		};
		ipcRenderer.on(channel, cb);
		return () => {
			//console.log("stop listening on ", channel);
			ipcRenderer.off(channel, cb);
		};
	},
	off: (channel: string, handler: (v: any) => any) => {},
};

contextBridge.exposeInMainWorld("bridge", CONTEXT_BRIDGE);
