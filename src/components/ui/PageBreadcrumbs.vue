<template>
	<v-breadcrumbs :items="breadcrumbs">
		<template #divider>
			<v-icon icon="i-mdi-chevron-right" />
		</template>
	</v-breadcrumbs>
</template>

<script setup lang="ts">
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
