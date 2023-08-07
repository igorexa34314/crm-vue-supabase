<template>
	<v-file-input v-bind="{ variant }" validate-on="blur lazy" class="text-input" single-line>
		<template #message="{ message }">
			{{ t(message) }}
		</template>
	</v-file-input>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { VTextField } from 'vuetify/components';
import { useDisplay } from 'vuetify';

const props = withDefaults(defineProps<{
	variant?: VTextField['variant'],
}>(), {
	variant: 'underlined',
});

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
</script>
