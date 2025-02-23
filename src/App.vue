<template>
	<GlobalSnackbar />

	<router-view #default="{ Component }">
		<template v-if="Component">
			<Suspense>
				<component :is="Component" />
				<template #fallback>
					<app-loader class="mt-7" page />
				</template>
			</Suspense>
		</template>
	</router-view>
</template>

<script setup lang="ts">
import GlobalSnackbar from '@/components/app/GlobalSnackbar.vue';
import { useDarkModeStore } from '@/stores/dark-mode';
import { useI18n } from 'vue-i18n';
import { appTitle } from '@/constants/app';
import { useSeoMeta } from '@unhead/vue';

const { t } = useI18n({ useScope: 'global' });

useSeoMeta({
	titleTemplate: (title?: string) => (title ? `${t(title)} | ${appTitle}` : appTitle),
});

useDarkModeStore();
</script>

<style lang="scss">
@use '@/assets/styles/main.scss';
</style>
