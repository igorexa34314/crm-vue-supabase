<template>
	<v-layout class="app bg-grey-darken-2 d-flex justify-center align-center overflow-hidden">
		<router-view />
	</v-layout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';

const { t, te } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { showMessage } = useSnackbarStore();

onMounted(() => {
	if (!userStore.info?.locale) {
		userStore.setLocale();
	}
});

watchEffect(() => {
	const { message, ...q } = route.query;
	if (te(`warnings.${message}`)) {
		showMessage(t(`warnings.${message}`));
		router.replace({ query: q });
	}
});

onUnmounted(() => {
	userStore.$reset();
});
</script>

<style lang="scss" scoped>
.app {
	min-height: 100dvh;
	min-height: 100vh;
}
</style>
