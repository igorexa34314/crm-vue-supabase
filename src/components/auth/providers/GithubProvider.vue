<template>
	<v-btn @click="signInWithGithubProvider" flat variant="text">
		<img :src="githubProvider" aspect-ratio="1" width="32" alt="Github" />
	</v-btn>
</template>

<script setup lang="ts">
import { AuthService } from '@/services/auth';
import { useTheme } from 'vuetify';

const theme = useTheme();
const githubProvider = new URL(
	`/src/assets/img/github-provider${theme.global.current.value.dark ? '_light' : ''}.png`,
	import.meta.url
).href;

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
