<template>
	<v-breadcrumbs :items="breadcrumbs">
		<template #divider>
			<v-icon :icon="mdiChevronRight" />
		</template>
	</v-breadcrumbs>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';
import type { RouteNamedMap } from 'vue-router/auto/routes';

export interface Breadcrumb {
	title: string;
	to?: keyof RouteNamedMap;
	disabled?: boolean;
}

defineProps<{
	breadcrumbs: Breadcrumb[];
}>();
</script>
