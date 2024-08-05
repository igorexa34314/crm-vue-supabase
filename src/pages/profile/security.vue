<template>
	<div>
		<v-form ref="form" @submit.prevent="submitHandler" class="profile-form mt-6 mt-sm-8 px-2 px-sm-4">
			<!-- <LocalizedInput v-model="formState.email" :rules="validations.email" variant="underlined" :label="$t('email')"
			class="mb-5" required /> -->

			<h4 class="text-subtitle-1 text-sm-h5 mb-3">{{ $t('change_password') }}</h4>

			<PassField
				v-model="formState.oldPass"
				:rules="validations.password"
				variant="underlined"
				:label="$t('password_current')"
				class="mb-5"
				required
				autocomplete="on" />

			<PassField
				v-model="formState.newPass"
				:rules="validations.password"
				variant="underlined"
				:label="$t('password_new')"
				class="mb-5"
				required
				repeater
				repeater-label="repeat_password"
				autocomplete="off" />

			<v-btn
				type="submit"
				color="success"
				:class="$vuetify.display.xs ? 'mt-3' : 'mt-5'"
				:disabled="!formState.newPass"
				:loading="loading">
				{{ $t('update') }}
				<v-icon :icon="mdiSend" class="ml-3" />
			</v-btn>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import PassField from '@/components/ui/PassField.vue';
// import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref } from 'vue';
import { mdiSend } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { user as validations } from '@/utils/validations';
import { useSnackbarStore } from '@/stores/snackbar';
import type { VForm } from 'vuetify/components';
import { changeUserPassword, changeUserEmail } from '@/api/auth';

const { t, te } = useI18n();
const { showMessage } = useSnackbarStore();

const form = ref<VForm | null>(null);

const loading = ref(false);

const formState = ref({
	email: '',
	oldPass: '',
	newPass: '',
});

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid) {
		try {
			loading.value = true;
			if (formState.value.oldPass && formState.value.newPass) {
				await changeUserPassword(formState.value.oldPass, formState.value.newPass);
				showMessage(t('updatePass_message'));
			}
			// if (email) {
			// 	await changeUserEmail(email);
			// }
		} catch (e) {
			if (typeof e === 'string') {
				showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : e.substring(0, 64), 'red-darken-3');
			} else {
				showMessage(t('error_update_profile'), 'red-darken-3');
			}
		} finally {
			loading.value = false;
		}
	}
};
</script>
