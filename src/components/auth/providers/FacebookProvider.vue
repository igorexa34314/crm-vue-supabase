<template>
	<v-btn @click="signInWithFacebookProvider" flat variant="text">
		<img src="/img/facebook-provider.png" aspect-ratio="1" width="32" alt="Facebook" />
	</v-btn>
</template>

<script setup lang="ts">
import { signInWithFacebook } from '@/api/auth';

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const signInWithFacebookProvider = () => {
	signInWithFacebook()
		.then(() => emit('success'))
		.catch(e => {
			console.error(e);
			emit('error', e);
		});
};
</script>
