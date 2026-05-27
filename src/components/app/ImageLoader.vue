<template>
	<div class="flex h-full items-center justify-center">
		<v-progress-circular
			:model-value="modelValue"
			:color="color"
			:size="size"
			:width="width"
			indeterminate
			:bg-color="bgColor"
			class="rounded-circle bg-[rgba(0,0,0,0.7)]"
			@click.capture="emit('cancel')">
			<v-icon icon="i-mdi-close" :size="iconSize" />
		</v-progress-circular>
	</div>
</template>

<script setup lang="ts">
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
