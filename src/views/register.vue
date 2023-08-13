<template>
	<v-card width="100%" :max-width="xs ? 400 : 450" class="pa-3 pa-sm-4">
		<v-card-title class="mb-2 text-center text-title">{{ t('home_bookkeeping') }}</v-card-title>

		<v-card-text>
			<LocalRegister @success="onRegisterSuccess" @error="onRegisterError" />
		</v-card-text>

		<v-card-actions class="justify-center text-subtitle-1">
			<p class="text-center text-primary">
				{{ t('have_account') + '? ' }}
				<router-link to="/login" tag="a">{{ t('login') + '!' }}</router-link>
			</p>
		</v-card-actions>
	</v-card>
</template>

<script setup lang="ts">
import LocalRegister from '@/components/auth/LocalRegister.vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'vue-meta';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

useMeta({ title: 'sign_in' });

const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const { push } = useRouter();
const { showMessage } = useSnackbarStore();

const onRegisterSuccess = async () => {
	showMessage(t('sign_in_success'));
	push('/');
}
const onRegisterError = async (e: unknown) => {
	if (typeof e === 'string') {
		showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : e, 'red-darken-3');
	}
	else {
		showMessage(t('error_register'), 'red-darken-3');
	}
}
</script>

<route lang="yaml">
meta:
  layout: empty
</route>