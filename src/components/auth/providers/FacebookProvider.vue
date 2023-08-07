<template>
	<v-btn @click="signInWithFacebookProvider" flat variant="text">
		<img :src="facebookProvider" aspect-ratio="1" width="32" alt="Facebook" />
	</v-btn>
</template>

<script setup lang="ts">
import facebookProvider from '@/assets/img/facebook-provider.png'
import { AuthService } from '@/services/auth';

const emit = defineEmits<{
	success: [],
	error: [err: unknown],
}>();

const signInWithFacebookProvider = () => {
	AuthService.signInWithFacebook().then(() => emit('success')).catch(e => {
		console.error(e);
		emit('error', e);
	});
}
</script>