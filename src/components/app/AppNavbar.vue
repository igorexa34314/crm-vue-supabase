<template>
	<v-app-bar :elevation="2" color="navbar">
		<template #prepend>
			<v-app-bar-nav-icon color="primary" @click.stop="emit('click')" />
		</template>
		<v-app-bar-title
			:text="$d(nowDate, xs ? 'time' : smAndDown ? 'daytime' : 'long')"
			class="text-primary mt-1 hidden sm:block" />
		<v-spacer />
		<DarkmodeToggle class="mr-7" />
		<v-menu v-if="userInfo">
			<template #activator="{ props }">
				<v-btn
					color="profile"
					variant="text"
					v-bind="props"
					class="px-1 py-1 flex md:mr-7 sm:px-3"
					append-icon="i-mdi-triangle-small-down"
					flat>
					<div class="text-body-large font-bold flex items-center">
						<v-img
							:src="photoURL || '/img/avatar-placeholder.jpg'"
							aspect-ratio="1"
							:width="xs ? 32 : 36"
							alt="User avatar"
							class="mr-2 md:mr-3"
							cover />
						<span>{{ username }}</span>
					</div>
				</v-btn>
			</template>
			<v-list density="comfortable">
				<v-list-item :active="false" to="/profile">
					<template #prepend>
						<v-icon icon="i-mdi-account-circle-outline" class="mr-3" />
					</template>
					<v-list-item-title class="text-primary">{{
						$t('pageTitles.profile')
					}}</v-list-item-title>
				</v-list-item>
				<v-list-item :active="false" @click="emit('logout')">
					<template #prepend>
						<v-icon icon="i-mdi-logout" class="mr-3" />
					</template>
					<v-list-item-title class="text-primary">{{ $t('logout') }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
		<v-skeleton-loader
			v-else
			type="list-item-avatar"
			width="100%"
			color="navbar"
			max-width="240px" />
	</v-app-bar>
</template>

<script setup lang="ts">
import DarkmodeToggle from '@/components/app/DarkmodeToggle.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';
import { useDisplay } from 'vuetify';
import type { UserInfo } from '@/api/user';

const { userInfo } = defineProps<{
	userInfo?: UserInfo | null;
}>();

const emit = defineEmits<{
	logout: [];
	click: [];
}>();

const { t } = useI18n();
const { xs, smAndDown } = useDisplay();

const username = computed(() => (userInfo ? `${userInfo.username}` : t('guest')));
const photoURL = computed(() => userInfo?.avatar_url);

const nowDate = useNow({ interval: 1000 });
</script>
