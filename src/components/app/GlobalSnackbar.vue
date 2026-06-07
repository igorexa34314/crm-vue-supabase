<template>
	<v-snackbar
		v-model="show"
		:color="sbProps.color"
		:timeout="sbProps.timeout"
		location="top"
		offset="-100"
		variant="elevated"
		elevation="3"
		transition="slide-y-transition">
		<p class="font-medium my-1 px-2">{{ sbProps.text }}</p>

		<template #actions>
			<v-btn variant="text" color="white" @click="show = false">
				<v-icon icon="i-mdi-close" />
			</v-btn>
		</template>
	</v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSnackbarStore, type Snackbar } from '@/stores/snackbar';
const snackbarStore = useSnackbarStore();

const show = ref(false);
const sbProps = computed<Snackbar>(() => ({
	color: snackbarStore.snackbar.color,
	text: snackbarStore.snackbar.text,
	timeout: snackbarStore.snackbar.timeout,
}));

snackbarStore.$onAction(({ name, after }) => {
	after(() => {
		if (name === 'showMessage' || name === 'showErrorMessage' || name === 'showSuccessMessage') {
			show.value = true;
		}
	});
});
</script>
