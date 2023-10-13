<template>
	<v-layout class="app bg-grey-darken-2 d-flex justify-center align-center overflow-hidden">
		<router-view />
	</v-layout>
</template>

<script setup lang="ts">
import { VLayout } from 'vuetify/components';
import { onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router/auto';
import { useUserStore } from '@/stores/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';

const { t, te } = useI18n({ useScope: 'global' });
const route = useRoute();
const { replace } = useRouter();
const userStore = useUserStore();
const { showMessage } = useSnackbarStore();

onMounted(() => {
	if (!userStore.info?.locale) {
		userStore.setLocale();
	}
});

watchEffect(() => {
	if (te(`warnings.${route.query.message}`)) {
		showMessage(t(`warnings.${route.query.message}`));
		replace({ query: undefined });
	}
});

onUnmounted(() => {
	userStore.$reset();
});
</script>

<style scoped>
.app {
	min-height: 100dvh;
	min-height: 100vh;
}
</style>
