import { createApp } from 'vue';
import App from '@/App.vue';
import router from '@/router';
import { createMetaManager } from 'vue-meta';
import vuetify from '@/plugins/vuetify';
import i18n, { setI18nLanguage } from '@/plugins/i18n';
import pinia from '@/plugins/pinia';
import { useInfoStore } from '@/stores/info';
import AppLoader from '@/components/app/AppLoader.vue';

const app = createApp(App);

app.use(router).use(i18n).use(pinia).use(createMetaManager()).use(vuetify);
app.component('app-loader', AppLoader);
app.mount('#app');

useInfoStore().$subscribeLocale(setI18nLanguage);
