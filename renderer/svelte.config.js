import { sveltePreprocess } from "svelte-preprocess";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postcssConfig = path.join(__dirname, "postcss.config.cjs");

export default {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		vitePreprocess({}),
		sveltePreprocess({
			postcss: {
				configFilePath: postcssConfig,
			},
		}),
	],
};
