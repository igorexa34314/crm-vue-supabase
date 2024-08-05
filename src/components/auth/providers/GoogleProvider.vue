<template>
	<v-btn @click="signInWithGoogleProvider" flat variant="text">
		<img src="/img/google-provider.png" aspect-ratio="1" width="32" alt="Google" />
	</v-btn>
</template>

<script setup lang="ts">
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
