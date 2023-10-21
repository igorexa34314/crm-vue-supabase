<template>
	<v-switch
		v-model="darkMode"
		class="darkmode-toggle text-switch"
		inset
		:false-icon="mdiWeatherSunny"
		:true-icon="mdiWeatherNight"
		hide-details
		density="compact"
		style="max-width: fit-content">
	</v-switch>
</template>

<script setup lang="ts">
import { VSwitch } from 'vuetify/components';
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useDarkModeStore } from '@/stores/darkMode';

const { darkMode } = storeToRefs(useDarkModeStore());

const switchToggleStyle = computed(() => (darkMode.value ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'));
</script>

<style lang="scss" scoped>
.darkmode-toggle {
	@media (max-width: 670px) {
		transform: scale(0.85);
	}
	@media (max-width: 420px) {
		transform: scale(0.82);
	}
	&:deep(.v-switch__track) {
		background-color: v-bind(switchToggleStyle) !important;
	}
}
</style>
