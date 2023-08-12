<template>
	<v-layout class="app bg-grey-darken-2 d-flex justify-center align-center overflow-hidden">
		<router-view />
	</v-layout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useInfoStore } from '@/stores/info';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';

const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const route = useRoute();
const infoStore = useInfoStore();
const info = computed(() => infoStore.info);
const { showMessage } = useSnackbarStore();

if (!info.value?.locale) {
	infoStore.setLocale();
}

watchEffect(() => {
	if (te(`warnings.${route.query.message}`)) {
		showMessage(t(`warnings.${route.query.message}`));
	}
});

onUnmounted(() => {
	infoStore.$reset();
});
</script>

<style scoped>
.app {
	min-height: 100vh;
}
</style>