<template>
	<app-loader v-if="loading" class="main-loader" />
	<v-layout v-else class="app-main-layout" full-height>
		<AppNavbar @click="drawer = !drawer" @logout="logout" />
		<AppSidebar v-model="drawer" />

		<v-main class="app bg-background" style="min-height: 100vh">
			<div class="app-content pa-sm-5 pa-4">
				<router-view />
			</div>
		</v-main>

		<v-tooltip activator=".fixed-action-btn" :text="t('create_record')"
			content-class="bg-fixed text-primary font-weight-medium" v-slot:activator="{ props }">
			<v-btn color="fixed" :size="xs ? 'default' : mdAndDown ? 'large' : 'x-large'" class="fixed-action-btn"
				to="/record" position="fixed" :icon="mdiPlus" v-bind="props" />
		</v-tooltip>
	</v-layout>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/app/AppNavbar.vue';
import AppSidebar from '@/components/app/AppSidebar.vue';
import { ref, onMounted, provide, onUnmounted } from 'vue';
import { CurrencyService } from '@/services/currency';
import { useInfoStore } from '@/stores/info';
import { mdiPlus } from '@mdi/js';
import { UserService } from '@/services/user';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAsyncState } from '@vueuse/core';
import { currencyKey } from '@/injection-keys';
import { useRouter } from 'vue-router';
import { AuthService } from '@/services/auth';
import { useDisplay } from 'vuetify';

let userInfoChannel: Awaited<ReturnType<typeof UserService.fetchInfo>>;
const { state: currency, isLoading, isReady, execute: refresh } = useAsyncState(CurrencyService.fetchCurrency, null);
provide(currencyKey, { currency, isLoading, isReady, refresh });

const { push } = useRouter();
const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { showMessage } = useSnackbarStore();
const infoStore = useInfoStore();
const drawer = ref(true);
const loading = ref(false);
const { xs, mdAndDown } = useDisplay();

onMounted(async () => {
	try {
		if (!infoStore.info || !Object.keys(infoStore.info).length) {
			userInfoChannel = await UserService.fetchAndSubscribeInfo();
		}
		await CurrencyService.fetchCurrency();
	} catch (e) {
		showMessage(te(`firebase.messages.${e}`) ? t(`firebase.messages.${e}`) : e as string);
	} finally {
		loading.value = false;
	}
});

onUnmounted(() => {
	userInfoChannel?.unsubscribe();
});

const logout = async () => {
	try {
		userInfoChannel?.unsubscribe();
		await AuthService.logout();
		push({
			path: '/login',
			query: {
				message: 'logout'
			}
		})
	} catch (e) {
		showMessage(te(`firebase.messages.${e}`) ? t(`firebase.messages.${e}`) : e as string);
	}
}

</script>

<style scoped>
.fixed-action-btn {
	right: 0;
	bottom: 0;
	transform: translate(-70%, -70%);
}

.main-loader {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 100;
}
</style>