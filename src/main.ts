import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { createHead } from '@unhead/vue';
import vuetify from '@/plugins/vuetify';
import { loadMessages, createI18nInstance, setI18nLocaleMessages } from '@/plugins/i18n';
import pinia from '@/plugins/pinia';
import { useUserStore } from '@/stores/user';
import vueQuery from '@/plugins/vueQuery';
import AppLoader from '@/components/app/AppLoader.vue';

loadMessages().then(({ locale, messages }) => {
	const i18n = createI18nInstance(locale, messages);

	const app = createApp(App);
	app.use(router).use(pinia).use(vueQuery).use(i18n);

	useUserStore().$subscribeLocale(locale => setI18nLocaleMessages(i18n, locale));

	app.use(createHead()).use(vuetify(i18n)).component('app-loader', AppLoader);

	app.mount('#app');
});
