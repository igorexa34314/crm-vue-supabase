<template>
	<v-form class="card-content" ref="form" @submit.prevent="submitRegister">
		<LocalizedInput
			v-model="formState.email"
			:rules="validations.email"
			variant="underlined"
			:label="$t('email')"
			required />

		<PassField
			v-model="formState.password"
			:rules="validations.password"
			variant="underlined"
			:label="$t('password')"
			class="mt-5"
			repeater
			required />

		<LocalizedInput
			v-model="formState.username"
			:rules="validations.username"
			variant="underlined"
			:counter="64"
			:label="$t('user.username')"
			class="mt-5"
			required />

		<v-checkbox
			v-model="formState.agree"
			:rules="validations.agree"
			class="mt-5"
			:density="$vuetify.display.xs ? 'compact' : 'default'"
			required>
			<template #label>
				<p>
					{{ $t('agree_with').charAt(0).toUpperCase() + $t('agree_with').slice(1) + ' '
					}}<a
						target="_blank"
						href="https://old.uinp.gov.ua/publication/derzhavnii-gimn-ukraini"
						>{{ $t('app_rules') }}</a
					>
				</p>
			</template>
		</v-checkbox>

		<div class="cf-turnstile"></div>

		<v-btn
			:text="$t('sign_in')"
			type="submit"
			v-bind="{ appendIcon: mdiSend, loading }"
			color="success"
			width="100%"
			class="mt-4 mt-sm-7" />
	</v-form>
</template>

<script setup lang="ts">
import PassField from '@/components/ui/PassField.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, useTemplateRef } from 'vue';
import { mdiSend } from '@mdi/js';
import { register } from '@/api/auth';
import { user as validations } from '@/utils/validations';
import { useTurnstile } from '@/composables/turnstile';
import { validateToken } from '@/api/turnstile';

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const turnstileToken = useTurnstile('.cf-turnstile');

const formRef = useTemplateRef('form');
const loading = ref(false);
const formState = ref({
	email: '',
	password: '',
	username: '',
	agree: false,
});

const submitRegister = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid) {
		try {
			loading.value = true;
			const data = await validateToken(turnstileToken.value);
			if (data.success) {
				await register(formState.value);
				emit('success');
			}
		} catch (e) {
			emit('error', e);
		} finally {
			loading.value = false;
		}
	}
};
</script>
