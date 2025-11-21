<template>
	<div>
		<v-form
			ref="form"
			@submit.prevent="submitHandler"
			class="profile-form mt-6 mt-sm-8 px-2 px-sm-4">
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
				:loading="changeUserPasswordAsyncStatus === 'loading'">
				{{ $t('update') }}
				<v-icon :icon="mdiSend" class="ml-3" />
			</v-btn>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import PassField from '@/components/ui/PassField.vue';
// import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, useTemplateRef } from 'vue';
import { mdiSend } from '@mdi/js';
import { user as validations } from '@/utils/validations';
import { /* useChangeUserEmail, */ useChangeUserPassword } from '@/mutations/auth';

const formRef = useTemplateRef('form');

const formState = ref({
	email: '',
	oldPass: '',
	newPass: '',
});

const { mutate: changeUserPassword, asyncStatus: changeUserPasswordAsyncStatus } =
	useChangeUserPassword();
// const { mutate: changeUserEmail } = useChangeUserEmail();

const submitHandler = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid) {
		if (formState.value.oldPass && formState.value.newPass) {
			changeUserPassword(formState.value);
		}
		// if (formState.value.email) {
		// 	changeUserEmail(formState.value.email);
		// }
	}
};
</script>
