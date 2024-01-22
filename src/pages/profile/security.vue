<template>
	<v-form ref="form" @submit.prevent="submitHandler" class="profile-form mt-6 mt-sm-8 px-2 px-sm-4">
		<!-- <LocalizedInput v-model="formState.email" :rules="validations.email" variant="underlined" :label="t('email')"
			class="mb-5" required /> -->

		<h4 class="text-subtitle-1 text-sm-h5 mb-3">{{ t('change_password') }}</h4>

		<PassField
			v-model="formState.oldPass"
			:rules="validations.password"
			variant="underlined"
			:label="t('password_current')"
			class="mb-5"
			required
			autocomplete="on" />

		<PassField
			v-model="formState.newPass"
			:rules="validations.password"
			variant="underlined"
			:label="t('password_new')"
			class="mb-5"
			required
			repeater
			repeater-label="repeat_password"
			autocomplete="off" />

		<v-btn
			type="submit"
			color="success"
			:class="xs ? 'mt-3' : 'mt-5'"
			:disabled="!formState.newPass"
			:loading="loading">
			{{ t('update') }}
			<v-icon :icon="mdiSend" class="ml-3" />
		</v-btn>
	</v-form>
</template>

<script setup lang="ts">
import PassField from '@/components/UI/PassField.vue';
// import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import { ref } from 'vue';
import { mdiSend } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { user as validations } from '@/utils/validations';
import { useDisplay } from 'vuetify';
import type { VForm } from 'vuetify/components';

const { loading } = defineProps<{
	loading?: boolean;
}>();

const emit = defineEmits<{
	changeCreds: [creds: Partial<{ oldPass: string; newPass: string; email: string }>];
}>();

const { t } = useI18n();
const { xs } = useDisplay();

const form = ref<VForm | null>(null);

const formState = ref({
	email: '',
	oldPass: '',
	newPass: '',
});

// watchEffect(() => {
// 	if (currentEmail.value) {
// 		formState.value = { ...formState.value, email: currentEmail.value };
// 	}
// })

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid) {
		emit('changeCreds', formState.value);
	}
};
</script>
