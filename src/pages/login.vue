<template>
	<v-layout
		class="bg-auth flex min-h-[100dvh] min-h-[100vh] items-center justify-center overflow-hidden">
		<v-card :max-width="xs ? 400 : 450" width="100%" class="p-3 sm:p-4" color="background">
			<v-card-title class="text-title text-center">{{ $t('home_bookkeeping') }}</v-card-title>

			<v-card-text>
				<LocalLogin @success="onLoginSuccess" @error="onLoginError" />

				<div class="mt-6 flex items-center justify-center">
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
import { watchEffect } from 'vue';
import { useDisplay } from 'vuetify';
import { useUserInfoQuery } from '@/queries/user';

const { t, te } = useI18n();
const { xs } = useDisplay();
const router = useRouter();
const route = useRoute();
const { showSuccessMessage, showErrorMessage } = useSnackbarStore();
useUserInfoQuery();

useSeoMeta({ title: () => t('login') });

watchEffect(() => {
	const { message, ...q } = route.query;
	if (te(`warnings.${message}`)) {
		showErrorMessage(t(`warnings.${message}`));
		router.replace({ query: q });
	}
});

const onLoginSuccess = () => {
	showSuccessMessage(t('login_success'));
	router.push('/');
};
const onLoginError = (e: unknown) => {
	showErrorMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : t('login_error'));
};
</script>
