<template>
	<v-textarea v-bind="{ variant }" validate-on="blur lazy" :density="xs ? 'compact' : 'default'" class="text-input">
		<template #message="{ message }">
			{{ t(message) }}
		</template>
	</v-textarea>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import type { VTextarea } from 'vuetify/components';

const { variant = 'underlined' } = defineProps<{
	variant?: VTextarea['variant'];
}>();

const { t } = useI18n();
const { xs } = useDisplay();
</script>
