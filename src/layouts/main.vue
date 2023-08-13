<template>
	<app-loader v-if="loading" class="main-loader" />
	<v-layout v-else class="app-main-layout" full-height>
		<AppNavbar @click="drawer = !drawer" @logout="logout" />
		<AppSidebar v-model="drawer" />

		<v-main class="app bg-background" style="min-height: 100dvh; min-height: 100vh">
			<div class="app-content pa-sm-5 pa-4">
				<router-view />
			</div>
		</v-main>

		<v-tooltip activator=".fixed-action-btn" :text="t('create_record')"
			content-class="bg-fixed text-primary font-weight-medium" #activator="{ props }">
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
import { useUserStore } from '@/stores/user';
import { mdiPlus } from '@mdi/js';
import { UserService } from '@/services/user';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAsyncState } from '@vueuse/core';
import { currencyKey } from '@/injection-keys';
import { useRouter } from 'vue-router';
import { AuthService } from '@/services/auth';
import { useDisplay } from 'vuetify';

const { push, replace, currentRoute } = useRouter();
const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { showMessage } = useSnackbarStore();
const infoStore = useUserStore();
const drawer = ref(true);
const loading = ref(false);
const { xs, mdAndDown } = useDisplay();

const { state: currency, isLoading, isReady, execute: refresh } = useAsyncState(CurrencyService.fetchCurrency, null, {
	onError: (e) => {
		showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : t('error_loading_currency'), 'red-darken-3')
	}
});

provide(currencyKey, { currency, isLoading, isReady, refresh });

let userInfoChannel: Awaited<ReturnType<typeof UserService.fetchAndSubscribeInfo>>;

onMounted(async () => {
	try {
		if (!infoStore.info || !Object.keys(infoStore.info).length) {
			userInfoChannel = await UserService.fetchAndSubscribeInfo();
		}
	} catch (e) {
		showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : e as string, 'red-darken-3');
	} finally {
		loading.value = false;
	}
});

onUnmounted(() => {
	userInfoChannel?.unsubscribe();
	infoStore.$reset();
});

const logout = async () => {
	try {
		await AuthService.logout();
		push({
			path: '/login',
			query: {
				message: 'logout'
			}
		});
	} catch (e) {
		showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : e as string, 'red-darken-3');
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

<route lang="yaml">
meta:
  auth: true
  requiresAuth: true
</route>