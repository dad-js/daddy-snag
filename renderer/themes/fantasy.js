/**
 * @type import("@skeletonlabs/tw-plugin").CustomThemeConfig
 */
export const fantasyTheme = {
	name: "fantasy",
	properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "4px",
		"--theme-rounded-container": "0px",
		"--theme-border-base": "4px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "255 255 255",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "255 255 255",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #6e1212
		"--color-primary-50": "233 219 219", // #e9dbdb
		"--color-primary-100": "226 208 208", // #e2d0d0
		"--color-primary-200": "219 196 196", // #dbc4c4
		"--color-primary-300": "197 160 160", // #c5a0a0
		"--color-primary-400": "154 89 89", // #9a5959
		"--color-primary-500": "110 18 18", // #6e1212
		"--color-primary-600": "99 16 16", // #631010
		"--color-primary-700": "83 14 14", // #530e0e
		"--color-primary-800": "66 11 11", // #420b0b
		"--color-primary-900": "54 9 9", // #360909
		// secondary | #be6741
		"--color-secondary-50": "245 232 227", // #f5e8e3
		"--color-secondary-100": "242 225 217", // #f2e1d9
		"--color-secondary-200": "239 217 208", // #efd9d0
		"--color-secondary-300": "229 194 179", // #e5c2b3
		"--color-secondary-400": "210 149 122", // #d2957a
		"--color-secondary-500": "190 103 65", // #be6741
		"--color-secondary-600": "171 93 59", // #ab5d3b
		"--color-secondary-700": "143 77 49", // #8f4d31
		"--color-secondary-800": "114 62 39", // #723e27
		"--color-secondary-900": "93 50 32", // #5d3220
		// tertiary | #edf849
		"--color-tertiary-50": "237 219 251", // #eddbfb
		"--color-tertiary-100": "231 207 250", // #e7cffa
		"--color-tertiary-200": "225 195 249", // #e1c3f9
		"--color-tertiary-300": "206 158 245", // #ce9ef5
		"--color-tertiary-400": "170 86 238", // #aa56ee
		"--color-tertiary-500": "133 13 231", // #850de7
		"--color-tertiary-600": "120 12 208", // #780cd0
		"--color-tertiary-700": "100 10 173", // #640aad
		"--color-tertiary-800": "80 8 139", // #50088b
		"--color-tertiary-900": "65 6 113", // #410671
		// success | #6faa55
		"--color-success-50": "233 242 230", // #e9f2e6
		"--color-success-100": "226 238 221", // #e2eedd
		"--color-success-200": "219 234 213", // #dbead5
		"--color-success-300": "197 221 187", // #c5ddbb
		"--color-success-400": "154 196 136", // #9ac488
		"--color-success-500": "111 170 85", // #6faa55
		"--color-success-600": "100 153 77", // #64994d
		"--color-success-700": "83 128 64", // #538040
		"--color-success-800": "67 102 51", // #436633
		"--color-success-900": "54 83 42", // #36532a
		// warning | #d3a936
		"--color-warning-50": "248 242 225", // #f8f2e1
		"--color-warning-100": "246 238 215", // #f6eed7
		"--color-warning-200": "244 234 205", // #f4eacd
		"--color-warning-300": "237 221 175", // #edddaf
		"--color-warning-400": "224 195 114", // #e0c372
		"--color-warning-500": "211 169 54", // #d3a936
		"--color-warning-600": "190 152 49", // #be9831
		"--color-warning-700": "158 127 41", // #9e7f29
		"--color-warning-800": "127 101 32", // #7f6520
		"--color-warning-900": "103 83 26", // #67531a
		// error | #bf1818
		"--color-error-50": "245 220 220", // #f5dcdc
		"--color-error-100": "242 209 209", // #f2d1d1
		"--color-error-200": "239 197 197", // #efc5c5
		"--color-error-300": "229 163 163", // #e5a3a3
		"--color-error-400": "210 93 93", // #d25d5d
		"--color-error-500": "191 24 24", // #bf1818
		"--color-error-600": "172 22 22", // #ac1616
		"--color-error-700": "143 18 18", // #8f1212
		"--color-error-800": "115 14 14", // #730e0e
		"--color-error-900": "94 12 12", // #5e0c0c
		// surface | #212121
		"--color-surface-50": "222 222 222", // #dedede
		"--color-surface-100": "211 211 211", // #d3d3d3
		"--color-surface-200": "200 200 200", // #c8c8c8
		"--color-surface-300": "166 166 166", // #a6a6a6
		"--color-surface-400": "100 100 100", // #646464
		"--color-surface-500": "33 33 33", // #212121
		"--color-surface-600": "30 30 30", // #1e1e1e
		"--color-surface-700": "25 25 25", // #191919
		"--color-surface-800": "20 20 20", // #141414
		"--color-surface-900": "16 16 16", // #101010
	},
	enhancements: {
		"[data-theme='fantasy'] h1,\n[data-theme='fantasy'] h2,\n[data-theme='fantasy'] h3,\n[data-theme='fantasy'] h4,\n[data-theme='fantasy'] h5,\n[data-theme='fantasy'] h6":
			{ fontWeight: "bold" },
		"[data-theme='fantasy']": {
			backgroundImage:
				"radial-gradient(at 0% 0%, rgba(var(--color-secondary-500) / 0.33) 0px, transparent 50%),\n\t\t\tradial-gradient(at 98% 1%, rgba(var(--color-error-500) / 0.33) 0px, transparent 50%)",
			backgroundAttachment: "fixed",
			backgroundPosition: "center",
			backgroundRepeat: "no-repeat",
			backgroundSize: "cover",
		},
	},
};
