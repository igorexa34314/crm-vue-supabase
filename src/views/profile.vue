<template>
	<div>
		<div class="title text-title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2">{{ t('pageTitles.profile') }}</h3>
		</div>

		<v-tabs v-model="currentTab" density="comfortable" class="mt-6 mb-3 mb-sm-0" color="primary">
			<v-tab
				v-for="tab in profileTabs"
				:key="tab.route?.toString()"
				:to="tab.route"
				:value="tab.route"
				:size="xs ? 'small' : 'default'"
				:text="t(`tabs.${tab.title}`)" />
		</v-tabs>

		<div class="profile-tab__window">
			<router-view v-slot="{ Component, route }">
				<v-slide-x-transition>
					<keep-alive include="info">
						<component
							:is="Component"
							:loading="loading"
							@[getTabByRouteName(route.name?.toString()).updateEvent.name]="
								getTabByRouteName(route.name?.toString()).updateEvent.on
							"
							class="profile-tab__window-item mt-6 mt-sm-8 px-2 px-sm-4" />
					</keep-alive>
				</v-slide-x-transition>
			</router-view>
		</div>
	</div>
</template>

<script setup lang="ts">
import { changeUserPassword, changeUserEmail } from '@/api/auth';
import { ref, watchEffect } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { updateInfo, updateAvatar, type UserInfo } from '@/api/user';
import { definePage, useRoute, useRouter, type RouteLocationRaw } from 'vue-router/auto';
import { useDisplay } from 'vuetify';

definePage({ redirect: { name: '/profile/info' } });
useMeta({ title: 'pageTitles.profile' });

const { t, te } = useI18n({ useScope: 'global' });
const { xs } = useDisplay();
const { showMessage } = useSnackbarStore();
const route = useRoute('/profile/info');
const { replace } = useRouter();

watchEffect(() => {
	if (te(`${route.query.message}`)) {
		showMessage(t(`${route.query.message}`));
		replace({ query: undefined });
	}
});

const currentTab = ref(route.name);

const loading = ref(false);

const updateUserInfo = async ({ avatar, ...userdata }: Omit<UserInfo, 'bill' | 'email'> & { avatar: File[] }) => {
	try {
		loading.value = true;
		await updateInfo(userdata);
		if (avatar.length) {
			await updateAvatar(avatar);
		}
		showMessage(t('updateProfile_message'));
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : e.substring(0, 64), 'red-darken-3');
		} else {
			showMessage(t('error_update_profile'), 'red-darken-3');
		}
	} finally {
		loading.value = false;
	}
};

const updateCreds = async ({
	oldPass,
	newPass, // email,
}: Partial<{ oldPass: string; newPass: string; email: string }>) => {
	try {
		loading.value = true;
		if (oldPass && newPass) {
			await changeUserPassword(oldPass, newPass);
			showMessage(t('updatePass_message'));
		}
		// if (email) {
		// 	await changeUserEmail(email);
		// }
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : e.substring(0, 64), 'red-darken-3');
		} else {
			showMessage(t('error_update_profile'), 'red-darken-3');
		}
	} finally {
		loading.value = false;
	}
};

const profileTabs = [
	{
		title: 'info',
		route: '/profile/info' as RouteLocationRaw,
		updateEvent: { name: 'updateInfo' as const, on: updateUserInfo },
	},
	{
		title: 'security',
		route: '/profile/security' as RouteLocationRaw,
		updateEvent: { name: 'changeCreds' as const, on: updateCreds },
	},
];

const getTabByRouteName = (name?: RouteLocationRaw) => {
	return profileTabs.find(tab => tab.route === name) ?? profileTabs[0];
};
</script>
