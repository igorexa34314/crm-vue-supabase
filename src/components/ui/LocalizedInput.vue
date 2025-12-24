<template>
	<v-text-field
		v-bind="{
			variant,
			validateOn,
			density: density || (xs ? 'compact' : 'default'),
			...props,
		}"
		class="text-input">
		<template #message="{ message }">
			{{ $t(message) }}
		</template>
		<template #append-inner="slotProps">
			<slot name="append-inner" v-bind="slotProps"></slot>
		</template>
	</v-text-field>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';
import type { VTextField } from 'vuetify/components';

type VTextFieldProps = VTextField['$props'];

interface Props extends /* @vue-ignore */ VTextFieldProps {
	variant?: VTextFieldProps['variant'];
	validateOn?: VTextFieldProps['validateOn'];
	density?: VTextFieldProps['density'];
}

const {
	variant = 'underlined',
	validateOn = 'blur lazy',
	density,
	...props
} = defineProps<Props>();

defineSlots<{
	'append-inner': VTextField['$slots']['append-inner'];
}>();

const { xs } = useDisplay();
</script>
