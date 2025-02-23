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
			autocomplete="on"
			required />

		<v-btn
			:text="$t('login')"
			type="submit"
			width="100%"
			color="success"
			class="mt-4 mt-sm-8"
			v-bind="{ loading, appendIcon: mdiSend }" />
	</v-form>
</template>

<script setup lang="ts">
import PassField from '@/components/ui/PassField.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, useTemplateRef } from 'vue';
import { mdiSend } from '@mdi/js';
import { login } from '@/api/auth';
import { user as validations } from '@/utils/validations';

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const formRef = useTemplateRef('form');
const loading = ref(false);

const formState = ref({
	email: '',
	password: '',
});

const submitLogin = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid) {
		try {
			loading.value = true;
			await login(formState.value);
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
