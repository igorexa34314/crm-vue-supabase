<template>
	<v-dialog
		v-model="confirmationDialog"
		:transition="VFadeTransition"
		:attach="attach"
		width="auto"
		eager
		content-class="w-100">
		<template #activator="{ props, isActive }">
			<slot name="activator" v-bind="{ props, isActive }"></slot>
		</template>
		<template #default="{ isActive }">
			<v-card v-bind="{ maxWidth, width }" :class="contentClass" class="mx-auto pt-2 pt-sm-4">
				<v-card-title
					v-if="title || slots.title"
					class="text-h5 text-center"
					style="white-space: inherit; line-height: 1.4; hyphens: none">
					<slot name="title" v-bind="{ isActive }">{{ title }}</slot>
				</v-card-title>
				<v-card-text v-if="text || slots.default">
					<slot v-bind="{ isActive }">{{ text }}</slot>
				</v-card-text>
				<v-card-actions class="mt-4 mt-sm-6">
					<v-spacer />
					<slot name="cancel" v-bind="{ cancelEvent: cancel }">
						<v-btn color="red-darken-1" variant="text" @click="cancel">
							<span class="text-h6">{{ cancelLabel || t('cancel') }}</span>
						</v-btn>
					</slot>
					<slot name="submit" v-bind="{ submitEvent: submit }">
						<v-btn :ref="el => (submitBtn = el as VBtn)" color="green-darken-1" variant="text" @click="submit">
							<span class="text-h6">{{ submitLabel || t('submit') }}</span>
						</v-btn>
					</slot>
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { VBtn, VDialog, VFadeTransition } from 'vuetify/components';
import { useVModel } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

interface Props {
	modelValue?: boolean;
	maxWidth?: string | number;
	width?: string | number;
	title?: string;
	text?: string;
	attach?: VDialog['attach'];
	activator?: VDialog['activator'];
	submitLabel?: string;
	cancelLabel?: string;
	contentClass?: VDialog['contentClass'];
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: false,
	maxWidth: '550px',
	width: '100%',
});

const emit = defineEmits<{
	'update:modelValue': [val: boolean];
	onSubmit: [];
	onCancel: [];
}>();

const slots = defineSlots<{
	title: VDialog['$slots']['default'];
	default: VDialog['$slots']['default'];
	activator: VDialog['$slots']['activator'];
	cancel(arg: { cancelEvent: () => void }): any;
	submit(arg: { submitEvent: () => void }): any;
}>();

const { t } = useI18n({ useScope: 'global' });

const confirmationDialog = useVModel(props, 'modelValue', emit);
const submitBtn = ref<VBtn>();

watch(
	confirmationDialog,
	newVal => {
		if (newVal) {
			nextTick().then(() => (submitBtn.value?.$el as HTMLButtonElement | null)?.focus());
		}
	},
	{ flush: 'post' }
);

const cancel = () => {
	emit('onCancel');
	confirmationDialog.value = false;
};
const submit = () => {
	emit('onSubmit');
	confirmationDialog.value = false;
};
</script>
