<template>
	<v-layout
		class="bg-grey-darken-2 flex min-h-[100dvh] min-h-[100vh] items-center justify-center overflow-hidden">
		<v-card :max-width="xs ? 400 : 450" width="100%" class="p-3 sm:p-4" color="background">
			<v-card-title class="text-title text-center">{{ $t('home_bookkeeping') }}</v-card-title>

			<v-card-text>
				<LocalLogin @success="onLoginSuccess" @error="onLoginError" />

				<div class="providers mt-6 flex items-center justify-center">
					<GoogleProvider @error="onLoginError" />

					<FacebookProvider @error="onLoginError" />

					<GithubProvider @error="onLoginError" />
				</div>
			</v-card-text>

			<v-card-actions class="mt-1 p-2 justify-center sm:mt-3 sm:p-4">
				<div class="text-body-large text-primary text-center">
					{{ $t('no_account') + '? ' }}
					<router-link to="/register"> {{ $t('sign_in') }}</router-link>
				</div>
			</v-card-actions>
		</v-card>
	</v-layout>
</template>

<script setup lang="ts">
import LocalLogin from '@/components/auth/LocalLogin.vue';
import GithubProvider from '@/components/auth/providers/GithubProvider.vue';
import FacebookProvider from '@/components/auth/providers/FacebookProvider.vue';
import GoogleProvider from '@/components/auth/providers/GoogleProvider.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSeoMeta } from '@unhead/vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, watchEffect } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDisplay } from 'vuetify';

const { t, te } = useI18n({ useScope: 'global' });
const { xs } = useDisplay();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { showMessage } = useSnackbarStore();

useSeoMeta({ title: () => t('login') });

onMounted(() => {
	if (!userStore.info?.locale) {
		userStore.setLocale();
	}
});

watchEffect(() => {
	const { message, ...q } = route.query;
	if (te(`warnings.${message}`)) {
		showMessage(t(`warnings.${message}`));
		router.replace({ query: q });
	}
});

onUnmounted(() => {
	userStore.$reset();
});

const onLoginSuccess = () => {
	showMessage(t('login_success'));
	router.push('/');
};
const onLoginError = (e: unknown) => {
	showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : t('login_error'), 'red-darken-3');
};
</script>
