<template>
	<div>
		<LocalizedInput v-model="password" :type="passFieldState.showPass ? 'text' : 'password'"
			v-bind="{ rules, label, placeholder, variant }" required v-slot:append-inner>
			<v-icon :icon="passFieldState.showPass ? mdiEye : mdiEyeOff" @mousedown="passFieldState.showPass = true"
				@mouseup="passFieldState.showPass = false" class="mr-2" style="cursor: pointer" />
		</LocalizedInput>

		<LocalizedInput v-if="repeater" :type="passFieldState.showRepeater ? 'text' : 'password'"
			v-bind="{ rules: validations.repeater(password), label: t(repeaterLabel), placeholder: t(repeaterPlaceholder), variant, class: repeaterClass }"
			class="mt-4" required v-slot:append-inner>
			<v-icon :icon="passFieldState.showRepeater ? mdiEye : mdiEyeOff" @mousedown="passFieldState.showRepeater = true"
				@mouseup="passFieldState.showRepeater = false" class="mr-2" style="cursor: pointer" />
		</LocalizedInput>
	</div>
</template>

<script setup lang="ts">
import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { reactive } from 'vue';
import { user as validations } from '@/utils/validations';
import { useVModel } from '@vueuse/core';
import { VTextField } from 'vuetify/components';
import { useI18n } from 'vue-i18n';

interface Props {
	modelValue?: string;
	repeater?: boolean;
	label?: VTextField['label'];
	repeaterLabel?: VTextField['label'];
	placeholder?: VTextField['placeholder'];
	repeaterPlaceholder?: VTextField['placeholder'];
	rules?: VTextField['rules'];
	variant?: VTextField['variant'];
	passClass?: string;
	repeaterClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	repeater: false,
	placeholder: 'Введите пароль',
	label: 'password',
	rules: () => validations.password,
	variant: 'underlined',
	repeaterLabel: () => 'password_repeat',
	repeaterPlaceholder: () => 'repeat_password',
});

const emit = defineEmits<{
	'update:modelValue': [pass: string]
}>();

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });

const passFieldState = reactive({
	showPass: false,
	showRepeater: false,
});

const password = useVModel(props, 'modelValue', emit)
</script>