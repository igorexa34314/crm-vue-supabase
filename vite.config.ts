import { defineConfig, loadEnv } from 'vite';
import { URL, fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import VueRouter from 'unplugin-vue-router/vite';
import Layouts from 'vite-plugin-vue-layouts';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const { BASE, PORT } = loadEnv(mode, process.cwd(), '');

	return {
		base: BASE ?? '/',
		server: {
			port: +(PORT ?? 3000),
		},
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},
		plugins: [
			VueI18nPlugin({
				globalSFCScope: true,
				include: [fileURLToPath(new URL('./src/locales/**', import.meta.url))],
			}),
			VueRouter({
				routesFolder: 'src/pages',
				dts: 'src/types/typed-router.d.ts',
			}),
			vue({
				script: {
					propsDestructure: true,
				},
				template: { transformAssetUrls },
			}),
			Layouts({
				pagesDirs: 'src/pages',
				layoutsDirs: 'src/layouts',
				defaultLayout: 'main',
			}),
			vuetify({ autoImport: true, styles: 'sass' }),
			{
				...visualizer({ filename: 'bundle-stats.html' }),
				apply: () => mode === 'analyze',
			},
		],
	};
});
