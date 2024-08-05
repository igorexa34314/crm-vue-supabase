<template>
	<GlobalSnackbar />

	<Suspense>
		<router-view />
		<template #fallback>
			<app-loader class="mt-7" page />
		</template>
	</Suspense>
</template>

<script setup lang="ts">
import GlobalSnackbar from '@/components/app/GlobalSnackbar.vue';
import { useDarkModeStore } from '@/stores/darkMode';
import { useI18n } from 'vue-i18n';
import { appTitle } from '@/constants/app';
import { useSeoMeta } from '@unhead/vue';

useSeoMeta({
	titleTemplate: (title?: string) => (title ? `${t(title)} | ${appTitle}` : appTitle),
});
const { t } = useI18n({ useScope: 'global' });
useDarkModeStore();
</script>

<style lang="scss">
@import '@/assets/styles/main.scss';
</style>
