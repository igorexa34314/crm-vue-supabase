import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { createMetaManager } from 'vue-meta';
import vuetify from '@/plugins/vuetify';
import i18n, { setI18nLanguage } from '@/plugins/i18n';
import pinia from '@/plugins/pinia';
import { useUserStore } from '@/stores/user';
import AppLoader from '@/components/app/AppLoader.vue';

const app = createApp(App);

app.use(router).use(i18n).use(pinia).use(createMetaManager());

const userStore = useUserStore();
userStore.$subscribeLocale(setI18nLanguage);

app.use(vuetify).component('app-loader', AppLoader);

app.mount('#app');
