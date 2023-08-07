<template>
	<v-textarea v-bind="{ variant }" validate-on="blur lazy" :density="xs ? 'compact' : 'default'" class="text-input"
		v-slot:message="{ message }">
		{{ t(message) }}
	</v-textarea>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { VTextField } from 'vuetify/components';
import { useDisplay } from 'vuetify';

const props = withDefaults(defineProps<{
	variant?: VTextField['variant']
}>(), {
	variant: 'underlined'
});

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
</script>
