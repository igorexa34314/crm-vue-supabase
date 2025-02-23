<template>
	<v-textarea
		v-bind="{
			variant,
			validateOn,
			density: density || ($vuetify.display.xs ? 'compact' : 'default'),
			...props,
		}"
		class="text-input">
		<template #message="{ message }">
			{{ $t(message) }}
		</template>
	</v-textarea>
</template>

<script setup lang="ts">
import type { VTextarea } from 'vuetify/components';

type VTextareaProps = VTextarea['$props'];

interface Props extends /* @vue-ignore */ VTextareaProps {
	variant?: VTextareaProps['variant'];
	validateOn?: VTextareaProps['validateOn'];
	density?: VTextareaProps['density'];
}

const {
	variant = 'underlined',
	validateOn = 'blur lazy',
	density,
	...props
} = defineProps<Props>();
</script>
