<template>
	<v-textarea
		v-bind="{ variant }"
		validate-on="blur lazy"
		:density="$vuetify.display.xs ? 'compact' : 'default'"
		class="text-input">
		<template #message="{ message }">
			{{ $t(message) }}
		</template>
	</v-textarea>
</template>

<script setup lang="ts">
import type { VTextarea } from 'vuetify/components';

const { variant = 'underlined' } = defineProps<{
	variant?: VTextarea['variant'];
}>();
</script>
