<template>
	<v-file-input v-bind="{ variant }" validate-on="blur lazy" class="text-input" single-line>
		<template #message="{ message }">
			{{ t(message) }}
		</template>
	</v-file-input>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { VFileInput } from 'vuetify/components';

const { variant = 'underlined' } = defineProps<{
	variant?: VFileInput['variant'];
}>();

const { t } = useI18n();
</script>
