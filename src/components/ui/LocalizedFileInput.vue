<template>
	<v-file-input v-bind="{ variant, validateOn, singleLine, ...props }" class="text-input">
		<template #message="{ message }">
			{{ $t(message) }}
		</template>
	</v-file-input>
</template>

<script setup lang="ts">
import type { VFileInput } from 'vuetify/components';

type VFileInputProps = VFileInput['$props'];

interface Props extends /* @vue-ignore */ VFileInputProps {
	variant?: VFileInputProps['variant'];
	validateOn?: VFileInputProps['validateOn'];
	singleLine?: VFileInputProps['singleLine'];
}

const {
	variant = 'underlined',
	validateOn = 'blur lazy',
	singleLine = true,
	...props
} = defineProps<Props>();
</script>
