<template>
	<v-form class="card-content" ref="form" @submit.prevent="submitRegister">
		<LocalizedInput
			v-model="formState.email"
			:rules="validations.email"
			variant="underlined"
			:label="t('email')"
			required />

		<PassField
			v-model="formState.password"
			:rules="validations.password"
			variant="underlined"
			:label="t('password')"
			class="mt-5"
			validate-on="lazy blur"
			repeater
			required />

		<LocalizedInput
			v-model="formState.username"
			:rules="validations.username"
			variant="underlined"
			:counter="64"
			:label="t('user.username')"
			class="mt-5"
			validate-on="lazy blur"
			required />

		<v-checkbox
			v-model="formState.agree"
			:rules="validations.agree"
			class="mt-5"
			validate-on="lazy blur"
			:density="xs ? 'compact' : 'default'"
			required>
			<template #label>
				<p>
					{{ t('agree_with').charAt(0).toUpperCase() + t('agree_with').slice(1) + ' '
					}}<a target="_blank" href="https://old.uinp.gov.ua/publication/derzhavnii-gimn-ukraini">{{
						t('app_rules')
					}}</a>
				</p>
			</template>
		</v-checkbox>

		<div class="cf-turnstile"></div>

		<v-btn type="submit" v-bind="{ appendIcon: mdiSend, loading }" color="success" width="100%" class="mt-4 mt-sm-7">
			{{ t('sign_in') }}
		</v-btn>
	</v-form>
	<teleport to="body">
		<component
			:is="'script'"
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
			defer />
	</teleport>
</template>

<script setup lang="ts">
import PassField from '@/components/UI/PassField.vue';
import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import { ref } from 'vue';
import { mdiSend } from '@mdi/js';
import { AuthService } from '@/services/auth';
import { useI18n } from 'vue-i18n';
import { user as validations } from '@/utils/validations';
import { VForm, VCheckbox } from 'vuetify/components';
import { useDisplay } from 'vuetify';
import { useTurnStile } from '@/composables/useTurnstile';
import { TurnstileService } from '@/services/turnstile';

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const { t } = useI18n();
const { xs } = useDisplay();

const turnstileToken = useTurnStile('.cf-turnstile');

const form = ref<VForm>();
const loading = ref(false);
const formState = ref({
	email: '',
	password: '',
	username: '',
	agree: false,
});

const submitRegister = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid) {
		const { agree, ...data } = formState.value;
		try {
			loading.value = true;
			await TurnstileService.validateToken(turnstileToken);
			await AuthService.register(data);
			emit('success');
		} catch (e) {
			emit('error', e);
		} finally {
			loading.value = false;
		}
	}
};
</script>
