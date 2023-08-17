<template>
	<v-form @submit.prevent="submitLogin" ref="form">
		<LocalizedInput
			v-model.trim="formState.email"
			:rules="validations.email"
			variant="underlined"
			label="Email"
			class="mt-4"
			required />

		<PassField
			v-model.trim="formState.password"
			:rules="validations.password"
			variant="underlined"
			label="Пароль"
			class="mt-6"
			required />

		<v-btn type="submit" width="100%" color="success" class="mt-4 mt-sm-8" v-bind="{ loading, appendIcon: mdiSend }">
			{{ t('login') }}</v-btn
		>
	</v-form>
</template>

<script setup lang="ts">
import PassField from '@/components/UI/PassField.vue';
import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import { ref } from 'vue';
import { mdiSend } from '@mdi/js';
import { AuthService } from '@/services/auth';
import { useI18n } from 'vue-i18n';
import { user as validations } from '@/utils/validations';
import { VForm } from 'vuetify/components';

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const form = ref<VForm>();
const loading = ref(false);

const formState = ref({
	email: '',
	password: '',
});

const submitLogin = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid) {
		try {
			loading.value = true;
			await AuthService.login(formState.value);
			emit('success');
		} catch (e) {
			console.error(e);
			emit('error', e);
		} finally {
			loading.value = false;
		}
	}
};
</script>
