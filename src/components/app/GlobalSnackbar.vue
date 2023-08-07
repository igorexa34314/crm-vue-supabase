<template>
	<v-snackbar v-model="sbProps.show" :color="sbProps.color" :timeout="sbProps.timeout" location="top" offset="-100"
		variant="elevated" elevation="3" transition="slide-y-transition">
		<p class="px-2 font-weight-medium">{{ sbProps.text }}</p>

		<template #actions>
			<v-btn variant="text" color="white" @click="sbProps.show = false">
				<v-icon :icon="mdiClose" />
			</v-btn>
		</template>
	</v-snackbar>
</template>

<script setup lang="ts">
import { mdiClose } from '@mdi/js';
import { ref } from 'vue';
import { useSnackbarStore, Snackbar } from '@/stores/snackbar';
const { $onAction } = useSnackbarStore();

type SnackbarProps = Snackbar & { show: boolean };

const sbProps = ref<SnackbarProps>({
	show: false,
	color: '',
	text: '',
	timeout: 0,
});

$onAction(({ name, store, after }) => {
	after(() => {
		if (name === 'showMessage') {
			sbProps.value = { ...store.snackbar, show: true };
		}
	})
});
</script>
