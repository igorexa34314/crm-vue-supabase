import { createApp, watch } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { createHead } from '@unhead/vue/client';
import setupVuetify from '@/plugins/vuetify';
import { getLocale, loadMessages, setupI18n, setI18nLocaleMessages } from '@/plugins/i18n';
import pinia from '@/plugins/pinia';
import { useUserStore } from '@/stores/user';
import AppLoader from '@/components/app/AppLoader.vue';

const locale = getLocale();
loadMessages(locale).then(messages => {
	const i18n = setupI18n(locale, messages ?? {});

	const app = createApp(App);
	app.use(router).use(pinia).use(i18n);

	const userStore = useUserStore();

	watch(
		() => userStore.info?.locale,
		locale => {
			if (locale) {
				setI18nLocaleMessages(i18n, locale);
			}
		}
	);

	app.use(createHead()).use(setupVuetify(i18n)).component('app-loader', AppLoader);

	app.mount('#app');
});

declare module 'vue' {
	export interface GlobalComponents {
		AppLoader: (typeof import('@/components/app/AppLoader.vue'))['default'];
	}
}
