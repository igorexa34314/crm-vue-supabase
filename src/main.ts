import { createApp, watch } from 'vue';
import router from '@/router';
import { createHead } from '@unhead/vue/client';
import { createPinia } from 'pinia';
import setupPiniaColadaPlugin from '@/plugins/pinia-colada';
import { getLocale, loadMessages, setupI18n, setI18nLocaleMessages } from '@/plugins/i18n';
import setupVuetify from '@/plugins/vuetify';
import { useUserStore } from '@/stores/user';

import '@/assets/styles/layers.scss';

import 'unfonts.css';
import 'virtual:uno.css';
import 'vuetify/styles';

import '@/assets/styles/main.scss';

import App from '@/App.vue';
import AppLoader from '@/components/app/AppLoader.vue';

const locale = getLocale();
loadMessages(locale).then(messages => {
	const app = createApp(App);

	const pinia = createPinia();
	const head = createHead();

	const i18n = setupI18n(locale, messages ?? {});

	app.use(router).use(pinia).use(i18n).use(setupPiniaColadaPlugin(i18n, pinia));

	const userStore = useUserStore(pinia);

	watch(
		() => userStore.info?.locale,
		locale => {
			if (locale) {
				setI18nLocaleMessages(i18n, locale);
			}
		}
	);

	app.use(head).use(setupVuetify(i18n)).component('app-loader', AppLoader);

	app.mount('#app');
});

declare module 'vue' {
	export interface GlobalComponents {
		AppLoader: (typeof import('@/components/app/AppLoader.vue'))['default'];
	}
}
