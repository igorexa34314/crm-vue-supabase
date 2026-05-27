<template>
	<v-layout full-height>
		<app-loader
			v-if="isCurrencyPending"
			class="left-1/2 top-1/2 pos-fixed z-100 -translate-x-1/2 -translate-y-1/2" />

		<template v-else>
			<AppNavbar @click="drawer = !drawer" @logout="handleLogout" />
			<AppSidebar v-model="drawer" />

			<v-main class="bg-background min-h-[100dvh] min-h-[100vh]">
				<div class="p-4 sm:p-5">
					<router-view />
				</div>
			</v-main>

			<v-tooltip
				v-if="route.name !== '//records/create'"
				:text="$t('create_record')"
				content-class="bg-fixed text-primary font-medium">
				<template #activator="{ props }">
					<v-btn
						color="fixed"
						:size="xs ? 'default' : mdAndDown ? 'large' : 'x-large'"
						class="translate-[-70%,-70%] bottom-0 right-0"
						to="/records/create"
						position="fixed"
						icon="i-mdi-plus"
						v-bind="props" />
				</template>
			</v-tooltip>
		</template>
	</v-layout>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/app/AppNavbar.vue';
import AppSidebar from '@/components/app/AppSidebar.vue';
import { ref, onUnmounted, watchEffect } from 'vue';
import { useUserStore } from '@/stores/user';
import { fetchAndSubscribeInfo } from '@/api/user';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useRoute, useRouter } from 'vue-router';
import { logout } from '@/api/auth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useCurrencyQuery } from '@/queries/currency';
import { useDisplay } from 'vuetify';

definePage({
	meta: { requiresAuth: true },
});

const router = useRouter();
const route = useRoute();
const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();
const userStore = useUserStore();
const { mobile, xs, mdAndDown } = useDisplay();

const drawer = ref(!mobile.value);

watchEffect(() => {
	drawer.value = !mobile.value;
});

const { isPending: isCurrencyPending } = useCurrencyQuery();

let userInfoChannel: RealtimeChannel | null = null;

fetchAndSubscribeInfo()
	.then(channel => {
		userInfoChannel = channel;
	})
	.catch((e: unknown) => {
		showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : (e as string), 'red-darken-3');
	});

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
