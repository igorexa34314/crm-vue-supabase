<template>
	<LocalizedInput
		v-model="password"
		:type="passFieldState.showPass ? 'text' : 'password'"
		v-bind="{ ...$attrs, rules, label, placeholder, variant }"
		required>
		<template #append-inner>
			<v-icon
				:icon="passFieldState.showPass ? mdiEye : mdiEyeOff"
				@mousedown="passFieldState.showPass = true"
				@mouseup="passFieldState.showPass = false"
				class="mr-2 cursor-pointer" />
		</template>
	</LocalizedInput>

	<LocalizedInput
		v-if="repeater"
		:type="passFieldState.showRepeater ? 'text' : 'password'"
		v-bind="{
			rules: validations.repeater(password),
			label: $t(repeaterLabel),
			placeholder: $t(repeaterPlaceholder),
			variant,
			class: repeaterClass,
		}"
		class="mt-4"
		autocomplete="off"
		required>
		<template #append-inner>
			<v-icon
				:icon="passFieldState.showRepeater ? mdiEye : mdiEyeOff"
				@mousedown="passFieldState.showRepeater = true"
				@mouseup="passFieldState.showRepeater = false"
				class="mr-2 cursor-pointer" />
		</template>
	</LocalizedInput>
</template>

<script setup lang="ts">
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { reactive } from 'vue';
import { user as validations } from '@/utils/validations';
import type { VTextField } from 'vuetify/components';

defineOptions({
	inheritAttrs: false,
});

const {
	repeater,
	placeholder = 'Введите пароль',
	label = 'password',
	rules = validations.password,
	variant = 'underlined',
	repeaterLabel = 'password_repeat',
	repeaterPlaceholder = 'repeat_password',
} = defineProps<{
	repeater?: boolean;
	label?: VTextField['label'];
	repeaterLabel?: VTextField['label'];
	placeholder?: VTextField['placeholder'];
	repeaterPlaceholder?: VTextField['placeholder'];
	rules?: VTextField['rules'];
	variant?: VTextField['variant'];
	passClass?: string;
	repeaterClass?: string;
}>();

const password = defineModel<string>({ default: '' });

const passFieldState = reactive({
	showPass: false,
	showRepeater: false,
});
</script>
