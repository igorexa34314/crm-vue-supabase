<template>
	<v-card width="100%" :max-width="xs ? 400 : 450" class="pa-3 pa-sm-4">
		<v-card-title class="mb-2 text-center text-title">{{ t('home_bookkeeping') }}</v-card-title>

		<v-card-text>
			<LocalRegister @success="onRegisterSuccess" @error="onRegisterError" />
		</v-card-text>

		<v-card-actions class="justify-center text-subtitle-1">
			<p class="text-center text-primary">
				{{ t('have_account') + '? ' }}
				<router-link to="/login">{{ t('login') + '!' }}</router-link>
			</p>
		</v-card-actions>
	</v-card>
</template>

<script setup lang="ts">
import LocalRegister from '@/components/auth/LocalRegister.vue';
import { useRouter } from 'vue-router';
import { useHead } from '@unhead/vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

definePage({ meta: { layout: 'empty', requiresAuth: false } });

useHead({ title: 'sign_in' });

const { t, te } = useI18n({ useScope: 'global' });
const { xs } = useDisplay();
const router = useRouter();
const { showMessage } = useSnackbarStore();

const onRegisterSuccess = async () => {
	showMessage(t('sign_in_success'));
	router.push('/login');
};
const onRegisterError = async (e: unknown) => {
	if (typeof e === 'string') {
		if (e.includes('profiles_username_key')) {
			showMessage(t(`warnings.username_exists`));
		} else {
			showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : e.substring(0, 64), 'red-darken-3');
		}
	} else {
		showMessage(t('error_register'), 'red-darken-3');
	}
};
</script>
