export const sleep = (ms = 0) => new Promise<void>((res) => setTimeout(res, ms));
export const time = () => new Date().toLocaleTimeString();
export const noop = () => {};

const log = console.log;
console.log = noop;
console.warn = noop;
console.info = noop;
//console.error = noop;
export const logger = {
	info: (...args: any[]) => log(`[${time()}]`, ...args),
	debug: (...args: any[]) => log(`[${time()}]`, ...args),
};

export const stripTag = (obj: string, tag: string) => obj.substring(obj.lastIndexOf(tag));
