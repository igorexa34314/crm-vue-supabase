<template>
	<v-textarea v-bind="{ variant }" validate-on="blur lazy" :density="xs ? 'compact' : 'default'" class="text-input">
		<template #message="{ message }">
			{{ t(message) }}
		</template>
	</v-textarea>
</template>

<script setup lang="ts">
import { VTextarea } from 'vuetify/components';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

const { variant = 'underlined' } = defineProps<{
	variant?: VTextarea['variant'];
}>();

const { t } = useI18n();
const { xs } = useDisplay();
</script>
