<template>
	<v-switch
		:model-value="darkMode"
		class="text-switch max-w-fit scale-[0.85] md:scale-100 sm:scale-90 dark:[--v-track-bg:rgba(255,_255,_255,_0.4)] light:[--v-track-bg:rgba(0,_0,_0,_0.4)]"
		inset
		false-icon="i-mdi-weather-sunny"
		true-icon="i-mdi-weather-night"
		hide-details
		density="compact"
		@update:model-value="setDarkMode">
	</v-switch>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const darkMode = computed(() => theme.global.current.value.dark);

const setDarkMode = (value: boolean | null) => {
	if (typeof value !== 'boolean') {
		return;
	}
	theme.change(value ? 'dark' : 'light');
};
</script>
