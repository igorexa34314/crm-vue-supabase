<template>
	<v-app-bar :elevation="2" color="navbar">
		<template #prepend>
			<v-app-bar-nav-icon color="primary" @click.stop="emit('click')" />
		</template>
		<v-app-bar-title class="app-title mt-1 text-primary">
			{{ d(date, xs ? 'time' : smAndDown ? 'daytime' : 'long') }}
		</v-app-bar-title>
		<v-spacer />
		<DarkmodeToggle class="mr-7" />
		<v-menu>
			<template #activator="{ props }">
				<v-btn color="profile" variant="text" v-bind="props" class="py-1 d-flex px-sm-3 px-1 mr-md-7"
					:append-icon="mdiTriangleSmallDown" flat>
					<div class="text-subtitle-1 font-weight-bold d-flex align-center">
						<v-img :src="photoURL || avatarPlaceholder" :lazy-src="avatarPlaceholder" aspect-ratio="1"
							:width="xs ? 32 : 36" alt="User avatar" class="mr-2 mr-md-3" />
						<span>{{ username }}</span>
					</div>
				</v-btn>
			</template>
			<v-list density="comfortable">
				<v-list-item @click="push('/profile')">
					<template #prepend>
						<v-icon :icon="mdiAccountCircleOutline" class="mr-3" />
					</template>
					<v-list-item-title class="text-primary">{{ t('pageTitles.profile') }}</v-list-item-title>
				</v-list-item>
				<v-list-item @click="emit('logout')">
					<template #prepend>
						<v-icon :icon="mdiLogout" class="mr-3" />
					</template>
					<v-list-item-title class="text-primary">{{ t('logout') }}</v-list-item-title>
				</v-list-item>
			</v-list>
		</v-menu>
	</v-app-bar>
</template>

<script setup lang="ts">
import avatarPlaceholder from '@/assets/img/avatar-placeholder.jpg';
import DarkmodeToggle from '@/components/app/DarkmodeToggle.vue';
import { mdiTriangleSmallDown, mdiAccountCircleOutline, mdiLogout } from '@mdi/js';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useInfoStore } from '@/stores/info';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const emit = defineEmits<{
	logout: [],
	click: [],
}>();

const { t, d } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs, smAndDown } = useDisplay();
const { push } = useRouter();
const infoStore = useInfoStore();

const username = computed(() => infoStore.info ?
	`${infoStore.info?.username}`
	: t('guest'));
const photoURL = computed(() => infoStore.info?.photoURL);

const date = ref(new Date());

let dateInterval: NodeJS.Timer;
onMounted(() => {
	dateInterval = setInterval(() => date.value = new Date(), 1000 * 20);
});
onUnmounted(() => clearInterval(dateInterval));
</script>

<style lang="scss" scoped>
.app-title {
	@media(max-width: 420px) {
		display: none;
	}
}
</style>
