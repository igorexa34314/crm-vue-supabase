<template>
	<metainfo>
		<template #title="{ content }: any">
			{{ content ? `${t(content)} | ${AppTitle} ` : AppTitle }}
		</template>
	</metainfo>

	<GlobalSnackbar />

	<Suspense>
		<template #default>
			<router-view />
		</template>
		<template #fallback>
			<app-loader class="mt-7" page />
		</template>
	</Suspense>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDarkModeStore } from '@/stores/darkMode';
import GlobalSnackbar from '@/components/app/GlobalSnackbar.vue';
import { AppTitle } from '@/global-vars';

const { t } = useI18n({ useScope: 'global' });

const darkModeStore = useDarkModeStore();
</script>

<style lang="scss">
@import './assets/styles/main.scss';
</style>
