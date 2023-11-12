<template>
	<v-btn @click="signInWithGoogleProvider" flat variant="text">
		<img :src="googleProvider" aspect-ratio="1" width="32" alt="Google" />
	</v-btn>
</template>

<script setup lang="ts">
import googleProvider from '@/assets/img/google-provider.png';
import { signInWithGoogle } from '@/api/auth';

const emit = defineEmits<{
	success: [];
	error: [err: unknown];
}>();

const signInWithGoogleProvider = () => {
	signInWithGoogle()
		.then(() => emit('success'))
		.catch(e => {
			console.error(e);
			emit('error', e);
		});
};
</script>
