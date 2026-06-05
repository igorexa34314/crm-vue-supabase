<template>
	<v-layout
		class="bg-auth flex min-h-[100dvh] min-h-[100vh] items-center justify-center overflow-hidden">
		<v-card width="100%" :max-width="xs ? 400 : 450" class="p-3 sm:p-4">
			<v-card-title class="text-title mb-2 text-center">{{
				$t('home_bookkeeping')
			}}</v-card-title>

			<v-card-text>
				<LocalRegister @success="onRegisterSuccess" @error="onRegisterError" />
			</v-card-text>

			<v-card-actions class="text-body-large justify-center">
				<p class="text-primary text-center">
					{{ $t('have_account') + '? ' }}
					<router-link to="/login">{{ $t('login') + '!' }}</router-link>
				</p>
			</v-card-actions>
		</v-card>
	</v-layout>
</template>

<script setup lang="ts">
import LocalRegister from '@/components/auth/LocalRegister.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSeoMeta } from '@unhead/vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { onMounted, onUnmounted, watchEffect } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDisplay } from 'vuetify';

const { t, te } = useI18n();
const { xs } = useDisplay();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const { showSuccessMessage, showErrorMessage } = useSnackbarStore();

useSeoMeta({ title: () => t('sign_in') });

onMounted(() => {
	if (!userStore.info?.locale) {
		userStore.setLocale();
	}
});

watchEffect(() => {
	const { message, ...q } = route.query;
	if (te(`warnings.${message}`)) {
		showErrorMessage(t(`warnings.${message}`));
		router.replace({ query: q });
	}
});

onUnmounted(() => {
	userStore.$reset();
});

const onRegisterSuccess = async () => {
	showSuccessMessage(t('sign_in_success'));
	router.push('/login');
};
const onRegisterError = async (e: unknown) => {
	if (typeof e === 'string') {
		if (e.includes('profiles_username_key')) {
			showErrorMessage(t(`warnings.username_exists`));
		} else {
			showErrorMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : e.substring(0, 64));
		}
	} else {
		showErrorMessage(t('error_register'));
	}
};
</script>
