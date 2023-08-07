<template>
	<v-layout class="app bg-grey-darken-2 d-flex justify-center align-center">
		<router-view />
	</v-layout>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useInfoStore } from '@/stores/info';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';

const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const infoStore = useInfoStore();
const { setLocale, $reset } = infoStore;
const info = computed(() => infoStore.info);
const { showMessage } = useSnackbarStore();
const { query } = useRoute();

if (!info.value?.locale) {
	setLocale();
}
watch(() => query.message, () => {
	if (te(`firebase.messages.${query.message}`)) {
		showMessage(t(`firebase.messages.${query.message}`));
	}
}, { deep: true, immediate: true });

onUnmounted(() => {
	$reset();
});
</script>

<style scoped>
.app {
	min-height: 100vh;
	overflow: hidden;
}
</style>