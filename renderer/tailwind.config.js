import { join } from "path";
import { skeleton } from "@skeletonlabs/tw-plugin";
import { fantasyTheme } from "./themes/fantasy";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}"),
	],
	theme: {
		extend: {},
	},
	plugins: [
		skeleton({
			themes: {
				custom: [fantasyTheme],
				preset: [
					{ name: "crimson", enhancements: true },
					{ name: "skeleton", enhancements: true },
				],
			},
		}),
	],
};

export default config;
