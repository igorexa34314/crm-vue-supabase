<template>
	<v-text-field v-bind="{ variant }" validate-on="blur lazy" class="text-input" :density="xs ? 'compact' : 'default'">
		<template #message="{ message }">
			{{ t(message) }}
		</template>
		<template #append-inner="slotProps">
			<slot name="append-inner" v-bind="slotProps" />
		</template>
	</v-text-field>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import type { VTextField } from 'vuetify/components';

const { variant = 'underlined' } = defineProps<{
	variant?: VTextField['variant'];
}>();

defineSlots<{
	'append-inner': VTextField['$slots']['append-inner'];
}>();

const { t } = useI18n();
const { xs } = useDisplay();
</script>
