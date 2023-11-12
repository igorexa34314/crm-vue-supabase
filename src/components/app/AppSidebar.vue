<template>
	<v-navigation-drawer v-model="drawer" location="left" width="300" color="sidebar">
		<v-list>
			<v-list-item
				v-for="link in links"
				:key="link.url.toString()"
				:to="link.url"
				active-class="active"
				link
				:exact="link.exact"
				color="primary"
				class="px-5">
				<span class="font-weight-bold text-primary">{{ t('menu.' + link.title) }}</span>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { type RouteLocationRaw } from 'vue-router/auto';

const drawer = defineModel<boolean>('modelValue', {
	default: false,
});

const { t } = useI18n();

const links: { title: string; url: RouteLocationRaw; exact?: boolean }[] = [
	{ title: 'bill', url: '/', exact: true },
	{ title: 'history', url: '/history' },
	{ title: 'plan', url: '/planning' },
	{ title: 'newRecord', url: '/record' },
	{ title: 'categories', url: '/categories' },
];
</script>
