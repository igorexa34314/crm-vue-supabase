import { createApp } from 'vue';
import router from '@/router';
import { createHead } from '@unhead/vue/client';
import { createPinia } from 'pinia';
import setupPiniaColadaPlugin from '@/plugins/pinia-colada';
import { getLocale, loadMessages, setupI18n, setI18nLocaleMessages } from '@/plugins/i18n';
import setupVuetify from '@/plugins/vuetify';
import { useSnackbarStore } from '@/stores/snackbar';
import { useQueryCache, type EntryKey, type EntryKeyTagged } from '@pinia/colada';
import type { UserInfo } from '@/api/user';

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

	const queryCache = useQueryCache(pinia);
	const { showErrorMessage } = useSnackbarStore(pinia);

	queryCache.$onAction(({ name, args, after }) => {
		if (name === 'setQueryData') {
			const [key, data] = args;
			if (isUserQueryKey(key)) {
				after(() => {
					try {
						const info = data as UserInfo;
						setI18nLocaleMessages(i18n, info.locale);
					} catch {
						showErrorMessage(i18n.global.t('error_loading_locales'));
					}
				});
			}
		}
	});

	app.use(head).use(setupVuetify(i18n)).component('app-loader', AppLoader);

	app.mount('#app');
});

function isUserQueryKey(key: EntryKey): key is EntryKeyTagged<UserInfo> {
	return key.length === 1 && key[0] === 'user';
}

declare module 'vue' {
	export interface GlobalComponents {
		AppLoader: (typeof import('@/components/app/AppLoader.vue'))['default'];
	}
}
