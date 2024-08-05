<template>
	<v-btn @click="signInWithGithubProvider" flat variant="text">
		<img :src="setGithubProviderIcon" aspect-ratio="1" width="32" alt="Github" />
	</v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { signInWithGithub } from '@/api/auth';
import { useTheme } from 'vuetify';

const theme = useTheme();
const setGithubProviderIcon = computed(
	() => `/img/${theme.global.current.value.dark ? 'github-provider_light' : 'github-provider'}.png`
);

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const signInWithGithubProvider = () => {
	signInWithGithub()
		.then(() => emit('success'))
		.catch(e => {
			console.error(e);
			emit('error', e);
		});
};
</script>
