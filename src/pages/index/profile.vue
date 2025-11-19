<template>
	<div>
		<div class="title text-title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2">{{ $t('pageTitles.profile') }}</h3>
		</div>

		<v-tabs
			:model-value="$route.name"
			density="comfortable"
			class="mt-6 mb-3 mb-sm-0"
			color="primary">
			<v-tab
				v-for="tab in profileTabs"
				:key="tab.path"
				:to="tab.path"
				:value="tab.path"
				:size="$vuetify.display.xs ? 'small' : 'default'"
				:text="$t(`tabs.${tab.title}`)" />
		</v-tabs>

		<div class="profile-tab__window">
			<router-view #default="{ Component }">
				<v-slide-x-transition hide-on-leave>
					<component
						:is="Component"
						class="profile-tab__window-item mt-6 mt-sm-8 px-2 px-sm-4" />
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

definePage({ redirect: '/profile/info' });

const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();
const route = useRoute('//profile/info');
const router = useRouter();

useSeoMeta({ title: () => t('pageTitles.profile') });

watchEffect(() => {
	const { message, ...q } = route.query;
	if (te(`${message}`)) {
		showMessage(t(`${message}`));
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
