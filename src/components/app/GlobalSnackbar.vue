<template>
	<v-snackbar
		v-model="sbProps.show"
		:color="sbProps.color"
		:timeout="sbProps.timeout"
		location="top"
		offset="-100"
		variant="elevated"
		elevation="3"
		transition="slide-y-transition">
		<p class="font-medium my-1 px-2">{{ sbProps.text }}</p>

		<template #actions>
			<v-btn variant="text" color="white" @click="sbProps.show = false">
				<v-icon icon="i-mdi-close" />
			</v-btn>
		</template>
	</v-snackbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSnackbarStore, type Snackbar } from '@/stores/snackbar';

const { $onAction } = useSnackbarStore();

const sbProps = ref<Snackbar & { show: boolean }>({
	show: false,
	color: 'snackbar-success',
	text: '',
	timeout: 0,
});

$onAction(({ name, store, after }) => {
	after(() => {
		if (name === 'showMessage') {
			sbProps.value = { ...store.snackbar, show: true };
		}
	});
});
</script>
