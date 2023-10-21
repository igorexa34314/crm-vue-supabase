<template>
	<v-btn @click="signInWithGithubProvider" flat variant="text">
		<img :src="setGithubProviderIcon" aspect-ratio="1" width="32" alt="Github" />
	</v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AuthService } from '@/services/auth';
import { useTheme } from 'vuetify';
import githubProvider from '/src/assets/img/github-provider.png';
import githubProviderLight from '/src/assets/img/github-provider_light.png';

const theme = useTheme();
const setGithubProviderIcon = computed(() => (theme.global.current.value.dark ? githubProviderLight : githubProvider));

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const signInWithGithubProvider = () => {
	AuthService.signInWithGithub()
		.then(() => emit('success'))
		.catch(e => {
			console.error(e);
			emit('error', e);
		});
};
</script>
