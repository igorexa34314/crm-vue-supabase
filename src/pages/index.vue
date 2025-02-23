<template>
	<v-layout class="app-main-layout" full-height>
		<app-loader v-if="loading" class="main-loader" />

		<template v-else>
			<AppNavbar @click="drawer = !drawer" @logout="handleLogout" />
			<AppSidebar v-model="drawer" />

			<v-main class="app bg-background" style="min-height: 100dvh; min-height: 100vh">
				<div class="app-content pa-sm-5 pa-4">
					<router-view />
				</div>
			</v-main>

			<v-tooltip
				:text="$t('create_record')"
				content-class="bg-fixed text-primary font-weight-medium">
				<template #activator="{ props }">
					<v-btn
						color="fixed"
						:size="
							$vuetify.display.xs
								? 'default'
								: $vuetify.display.mdAndDown
									? 'large'
									: 'x-large'
						"
						class="fixed-action-btn"
						to="/records/create"
						position="fixed"
						:icon="mdiPlus"
						v-bind="props" />
				</template>
			</v-tooltip>
		</template>
	</v-layout>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/app/AppNavbar.vue';
import AppSidebar from '@/components/app/AppSidebar.vue';
import { ref, provide, onUnmounted, watch } from 'vue';
import { fetchCurrency } from '@/api/currency';
import { useUserStore } from '@/stores/user';
import { mdiPlus } from '@mdi/js';
import { fetchAndSubscribeInfo } from '@/api/user';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAsyncState } from '@vueuse/core';
import { currencyKey } from '@/injection-keys';
import { useRouter } from 'vue-router';
import { logout } from '@/api/auth';
import { RealtimeChannel } from '@supabase/supabase-js';

definePage({
	meta: { requiresAuth: true },
});

const router = useRouter();
const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();
const userStore = useUserStore();
const drawer = ref(true);
const loading = ref(false);

const {
	state: currency,
	isLoading,
	isReady,
	execute: loadCurrency,
} = useAsyncState((currency?: string) => fetchCurrency(currency ?? userStore.userCurrency), null, {
	resetOnExecute: false,
	onError: e => {
		showMessage(
			te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_loading_currency'),
			'red-darken-3'
		);
		userStore.resetUserCurrency();
	},
});

provide(currencyKey, { currency, isLoading, isReady, refresh: loadCurrency });

let userInfoChannel: RealtimeChannel | null = null;

fetchAndSubscribeInfo()
	.then(channel => {
		userInfoChannel = channel;
	})
	.catch((e: unknown) => {
		showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : (e as string), 'red-darken-3');
	});

watch(
	() => userStore.userCurrency,
	async newCurrency => {
		await loadCurrency(undefined, newCurrency);
	}
);

onUnmounted(() => {
	userInfoChannel?.unsubscribe();
	userStore.$reset();
});

const handleLogout = async () => {
	try {
		await logout();
		router.push({ path: '/login', query: { message: 'logout' } });
	} catch (e) {
		showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : (e as string), 'red-darken-3');
	}
};
</script>

<style lang="scss" scoped>
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
