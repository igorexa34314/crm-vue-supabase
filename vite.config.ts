import { defineConfig } from 'vite';
import { URL, fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';
import VueRouter from 'unplugin-vue-router/vite';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
	base: '/',
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
			dts: './src/types/typed-router.d.ts',
		}),
		vue({
			template: { transformAssetUrls },
		}),
		vuetify({ autoImport: { labs: true }, styles: 'sass' }),
		{
			...visualizer({ filename: 'stats.html', open: true }),
			apply: ({ mode }) => mode === 'analyze',
		},
		VueDevTools(),
	],
	optimizeDeps: {
		include: [
			'uuid',
			'chart.js',
			'vue-chartjs',
			'vuetify-birthdaypicker',
			'randomcolor',
			'deep-equal',
			'@vueuse/router',
		],
		exclude: ['vuetify'],
	},
});
