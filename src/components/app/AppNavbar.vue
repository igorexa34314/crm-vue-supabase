<template>
	<v-app-bar :elevation="2" color="navbar">
		<template #prepend>
			<v-app-bar-nav-icon color="primary" @click.stop="emit('click')" />
		</template>
		<v-app-bar-title
			:text="$d(nowDate, $vuetify.display.xs ? 'time' : $vuetify.display.smAndDown ? 'daytime' : 'long')"
			class="app-title d-xs-none mt-1 text-primary" />
		<v-spacer />
		<DarkmodeToggle class="mr-7" />
		<v-menu v-if="userStore.info">
			<template #activator="{ props }">
				<v-btn
					color="profile"
					variant="text"
					v-bind="props"
					class="py-1 d-flex px-sm-3 px-1 mr-md-7"
					:append-icon="mdiTriangleSmallDown"
					flat>
					<div class="text-subtitle-1 font-weight-bold d-flex align-center">
						<v-img
							:src="photoURL || '/img/avatar-placeholder.jpg'"
							aspect-ratio="1"
							:width="$vuetify.display.xs ? 32 : 36"
							alt="User avatar"
							class="mr-2 mr-md-3"
							cover />
						<span>{{ username }}</span>
					</div>
				</v-btn>
			</template>
			<v-list density="comfortable">
				<v-list-item :active="false" to="/profile">
					<template #prepend>
						<v-icon :icon="mdiAccountCircleOutline" class="mr-3" />
					</template>
					<v-list-item-title class="text-primary">{{ $t('pageTitles.profile') }}</v-list-item-title>
				</v-list-item>
				<v-list-item :active="false" @click="emit('logout')">
					<template #prepend>
						<v-icon :icon="mdiLogout" class="mr-3" />
					</template>
					<v-list-item-title class="text-primary">{{ $t('logout') }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
		<v-skeleton-loader v-else type="list-item-avatar" width="100%" color="navbar" max-width="240px" />
	</v-app-bar>
</template>

<script setup lang="ts">
import DarkmodeToggle from '@/components/app/DarkmodeToggle.vue';
import { mdiTriangleSmallDown, mdiAccountCircleOutline, mdiLogout } from '@mdi/js';
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
import { useNow } from '@vueuse/core';

const emit = defineEmits<{
	logout: [];
	click: [];
}>();

const { t } = useI18n();
const userStore = useUserStore();

const username = computed(() => (userStore.info ? `${userStore.info.username}` : t('guest')));
const photoURL = computed(() => userStore.info?.avatar_url);

const nowDate = useNow({ interval: 1000 });
</script>
