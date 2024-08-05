<template>
	<v-file-input v-bind="{ variant }" validate-on="blur lazy" class="text-input" single-line>
		<template #message="{ message }">
			{{ $t(message) }}
		</template>
	</v-file-input>
</template>

<script setup lang="ts">
import type { VFileInput } from 'vuetify/components';

const { variant = 'underlined' } = defineProps<{
	variant?: VFileInput['variant'];
}>();
</script>
