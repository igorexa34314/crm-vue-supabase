<template>
	<div class="d-flex align-center justify-center fill-height">
		<v-progress-circular
			:model-value="modelValue"
			:color="color"
			:size="size"
			:width="width"
			indeterminate
			:bg-color="bgColor"
			class="image-loader"
			@click.capture="emit('cancel')">
			<v-icon :icon="mdiClose" :size="iconSize" />
		</v-progress-circular>
	</div>
</template>

<script setup lang="ts">
import { mdiClose } from '@mdi/js';

const {
	color = 'grey-lighten-4',
	bgColor = 'grey-darken-4',
	size = 50,
	width = 4,
	iconSize = 26,
} = defineProps<{
	modelValue?: string | number;
	color?: string;
	bgColor?: string;
	size?: string | number;
	width?: string | number;
	iconSize?: string | number;
}>();

const emit = defineEmits<{
	cancel: [];
}>();
</script>

<style lang="scss" scoped>
.image-loader {
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.7);
}
</style>
