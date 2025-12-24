<template>
	<PiniaColadaDevtools />

	<GlobalSnackbar />

	<router-view #default="{ Component }">
		<Suspense v-if="Component">
			<component :is="Component" />
			<template #fallback>
				<app-loader class="mt-7" page />
			</template>
		</Suspense>
	</router-view>
</template>

<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools';
import GlobalSnackbar from '@/components/app/GlobalSnackbar.vue';
import { useDarkModeStore } from '@/stores/dark-mode';
import { appTitle } from '@/constants/app';
import { useSeoMeta } from '@unhead/vue';

useSeoMeta({
	titleTemplate: (title?: string) => (title ? `${title} | ${appTitle}` : appTitle),
});

useDarkModeStore();
</script>

<style lang="scss">
@use '@/assets/styles/main.scss';
</style>
