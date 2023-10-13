import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { createMetaManager } from 'vue-meta';
import vuetify from '@/plugins/vuetify';
import { initI18n, setI18nLocaleMessages } from '@/plugins/i18n';
import pinia from '@/plugins/pinia';
import { useUserStore } from '@/stores/user';
import AppLoader from '@/components/app/AppLoader.vue';

initI18n().then(i18n => {
	const app = createApp(App);
	app.use(router).use(pinia).use(i18n);

	useUserStore().$subscribeLocale(locale => setI18nLocaleMessages(i18n, locale));

	app.use(createMetaManager()).use(vuetify(i18n)).component('app-loader', AppLoader);

	app.mount('#app');
});
