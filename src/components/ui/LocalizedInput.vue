<template>
	<v-text-field
		v-bind="{ variant }"
		validate-on="blur lazy"
		class="text-input"
		:density="$vuetify.display.xs ? 'compact' : 'default'">
		<template #message="{ message }">
			{{ $t(message) }}
		</template>
		<template #append-inner="slotProps">
			<slot name="append-inner" v-bind="slotProps"></slot>
		</template>
	</v-text-field>
</template>

<script setup lang="ts">
import type { VTextField } from 'vuetify/components';

const { variant = 'underlined' } = defineProps<{
	variant?: VTextField['variant'];
}>();

defineSlots<{
	'append-inner': VTextField['$slots']['append-inner'];
}>();
</script>
