import { defineConfig, normalizePath  } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte(),
		viteStaticCopy({
			targets: [
			  {
				src: normalizePath(path.resolve(__dirname, './assets')) ,
				dest: normalizePath(path.resolve(__dirname, '../dist/renderer'))
			  }
			]
		  })
	],
	base: "./", // Use relative paths for electron
	resolve: {
		alias: {
			"@assets": path.resolve(__dirname, "./assets"),
			"@libs": path.resolve(__dirname, "./src/libs"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@renderer": path.resolve(__dirname, "./src"),
			"@context": path.resolve(__dirname, "../shared/context"),
			"@shared": path.resolve(__dirname, "../shared"),
			"@services": path.resolve(__dirname, "../electron/services"),
			"@workers": path.resolve(__dirname, "../electron/workers"),
			"@electron": path.resolve(__dirname, "../electron"),
		},
	},
	css: {
		transformer: "postcss",
	},
	build: {
		outDir: "../dist/renderer/",
	},
});
