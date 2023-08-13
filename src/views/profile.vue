<template>
	<div>
		<div class="title text-title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2">{{ t('pageTitles.profile') }}</h3>
		</div>
		<v-tabs v-model="currentTab" density="comfortable" class="mt-6 mb-3 mb-sm-0" color="primary">
			<v-tab v-for="tab in profileTabs" :key="tab.value" :value="tab.value" :size="xs ? 'small' : 'default'">
				{{ t(`tabs.${tab.title}`) }}
			</v-tab>
		</v-tabs>
		<v-window v-model="currentTab">
			<v-window-item v-for="tab in profileTabs" :key="tab.value" :value="tab.value">
				<component :is="tab.component" lass="mt-6 mt-sm-8 px-2 px-sm-4" @update-info="updateInfo" :loading="loading"
					@change-creds="updateCreds" />
			</v-window-item>
		</v-window>
	</div>
</template>

<script setup lang="ts">
import InfoForm from '@/components/profile/InfoForm.vue';
import SecurityForm from '@/components/profile/SecurityForm.vue';
import { AuthService } from '@/services/auth';
import { ref, watchEffect } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { UserService } from '@/services/user';
import { UserInfo } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

useMeta({ title: 'pageTitles.profile' });

const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const { showMessage } = useSnackbarStore();
const route = useRoute();
const { replace } = useRouter();

const profileTabs = [
	{ title: 'info', value: 'info', component: InfoForm },
	{ title: 'security', value: 'security', component: SecurityForm }
]
const currentTab = ref(profileTabs[0]);
const loading = ref(false);

const updateInfo = async ({ avatar, ...userdata }: Omit<UserInfo, 'bill' | 'email'> & { avatar: File[] }) => {
	try {
		loading.value = true;
		await UserService.updateUserInfo(userdata);
		if (avatar.length) {
			await UserService.updateUserAvatar(avatar);
		}
		showMessage(t('updateProfile_message'));
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : e, 'red-darken-3');
		}
		else {
			showMessage(t('error_update_profile'), 'red-darken-3');
		}
	}
	finally {
		loading.value = false;
	}
}

const updateCreds = async ({ oldPass, newPass, email }: Partial<{ oldPass: string, newPass: string, email: string }>) => {
	try {
		loading.value = true;
		if (oldPass && newPass) {
			await AuthService.changeUserPassword(oldPass, newPass);
			showMessage(t('updatePass_message'));
		}
		// if (email && ) {
		// 	await AuthService.changeUserEmail(email);
		// }
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : e, 'red-darken-3');
		}
		else {
			showMessage(t('error_update_profile'), 'red-darken-3');
		}
	}
	finally {
		loading.value = false;
	}
}

watchEffect(() => {
	if (te(`${route.query.message}`)) {
		showMessage(t(`${route.query.message}`));
		replace({ query: undefined })
	}
});
</script>