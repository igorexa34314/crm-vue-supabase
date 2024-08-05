<template>
	<v-breadcrumbs :items="breadcrumbs">
		<template #divider>
			<v-icon :icon="mdiChevronRight" />
		</template>
	</v-breadcrumbs>
</template>

<script setup lang="ts">
import { mdiChevronRight } from '@mdi/js';
import type { RouteLocationRaw } from 'vue-router';

export interface Breadcrumb {
	title: string;
	to?: RouteLocationRaw;
	disabled?: boolean;
}

defineProps<{
	breadcrumbs: Breadcrumb[];
}>();
</script>
