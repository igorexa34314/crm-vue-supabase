<template>
	<v-layout class="app bg-grey-darken-2 d-flex justify-center align-center overflow-hidden">
		<v-card
			:max-width="$vuetify.display.xs ? 400 : 450"
			width="100%"
			class="pa-3 pa-sm-4"
			color="background">
			<v-card-title class="text-center text-title">{{ $t('home_bookkeeping') }}</v-card-title>

			<v-card-text>
				<LocalLogin @success="onLoginSuccess" @error="onLoginError" />

				<div class="providers d-flex align-center mt-6 justify-center">
					<GoogleProvider @error="onLoginError" />

					<FacebookProvider @error="onLoginError" />

					<GithubProvider @error="onLoginError" />
				</div>
			</v-card-text>

			<v-card-actions class="mt-1 mt-sm-3 justify-center pa-2 pa-sm-4">
				<div class="text-center text-subtitle-1 text-primary">
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

useSeoMeta({ title: 'login' });

const { t, te } = useI18n({ useScope: 'global' });
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { showMessage } = useSnackbarStore();

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

<style lang="scss" scoped>
.app {
	min-height: 100dvh;
	min-height: 100vh;
}
</style>
