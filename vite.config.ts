import { defineConfig, loadEnv } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import Layouts from 'vite-plugin-vue-layouts';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import { RouteRecordRaw } from 'vue-router';

// https://vitejs.dev/config/
export default ({ mode }) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

	return defineConfig({
		appType: 'mpa',
		base: process.env.VITE_BASE || '/',
		server: {
			port: +process.env.VITE_PORT || 3000
		},
		resolve: {
			alias: {
				'@': resolve(dirname(fileURLToPath(import.meta.url)), './src')
			}
		},
		plugins: [
			vue({ template: { transformAssetUrls } }),
			VueI18nPlugin({
				globalSFCScope: true,
				include: [resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**')]
			}),
			Pages({
				dirs: 'src/views',
				extendRoute(route: RouteRecordRaw) {
					if (route.name !== 'login' && route.name !== 'register') {
						route.meta = { auth: true, requiresAuth: true };
					}
					if (route.name === 'index') {
						route.alias = '/home';
					}
					return route;
				}
			}),
			Layouts({
				layoutsDirs: 'src/layouts',
				defaultLayout: 'main'
			}),
			vuetify()
		]
	});
};
