<template>
	<v-text-field v-bind="{ variant }" validate-on="blur lazy" class="text-input" :density="xs ? 'compact' : 'default'">
		<template #message="{ message }">
			{{ t(message) }}
		</template>
		<template #append-inner>
			<slot name="append-inner" />
		</template>
	</v-text-field>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { VTextField } from 'vuetify/components';
import { useDisplay } from 'vuetify';

const props = withDefaults(
	defineProps<{
		variant?: VTextField['variant'];
	}>(),
	{
		variant: 'underlined',
	}
);

defineSlots<{
	'append-inner': any;
}>();

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
</script>
