<template>
	<v-navigation-drawer v-model="drawer" location="left" width="300" color="sidebar">
		<v-list>
			<v-list-item
				v-for="link in links"
				:key="link.to.toString()"
				:to="link.to"
				active-class="active"
				link
				:exact="link.exact"
				color="primary"
				class="px-5">
				<span class="font-weight-bold text-primary">{{ $t('menu.' + link.title) }}</span>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

const drawer = defineModel<boolean>();

const links: { title: string; to: RouteLocationRaw; exact?: boolean }[] = [
	{ title: 'bill', to: '/', exact: true },
	{ title: 'history', to: '/records' },
	{ title: 'plan', to: '/planning' },
	{ title: 'newRecord', to: '/records/create' },
	{ title: 'categories', to: '/categories' },
];
</script>
