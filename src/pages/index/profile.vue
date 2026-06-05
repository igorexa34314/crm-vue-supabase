<template>
	<div>
		<div class="text-title">
			<h3 class="text-headline-medium ml-2 mt-2 sm:text-headline-large sm:mt-4">
				{{ $t('pageTitles.profile') }}
			</h3>
		</div>

		<v-tabs
			:model-value="$route.name"
			density="comfortable"
			class="mb-3 mt-6 sm:mb-0"
			color="primary">
			<v-tab
				v-for="tab in profileTabs"
				:key="tab.path"
				:to="tab.path"
				:value="tab.path"
				:size="xs ? 'small' : 'default'"
				:text="$t(`tabs.${tab.title}`)" />
		</v-tabs>

		<div>
			<router-view #default="{ Component }">
				<v-slide-x-transition hide-on-leave>
					<component :is="Component" class="mt-6 px-2 sm:mt-8 sm:px-4" />
				</v-slide-x-transition>
			</router-view>
		</div>
	</div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue';
import { useSeoMeta } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router';
import { useDisplay } from 'vuetify';

definePage({ redirect: '/profile/info' });

const { t, te } = useI18n();
const { xs } = useDisplay();
const { showSuccessMessage } = useSnackbarStore();
const route = useRoute();
const router = useRouter();

useSeoMeta({ title: () => t('pageTitles.profile') });

watchEffect(() => {
	const { message, ...q } = route.query;
	if (te(`${message}`)) {
		showSuccessMessage(t(`${message}`));
		router.replace({ query: q });
	}
});

const profileTabs = [
	{
		title: 'info',
		path: '/profile/info',
	},
	{
		title: 'security',
		path: '/profile/security',
	},
] satisfies { title: string; path: RouteLocationRaw }[];
</script>
