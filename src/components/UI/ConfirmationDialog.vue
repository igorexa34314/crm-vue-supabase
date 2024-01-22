<template>
	<v-dialog
		v-model="confirmationDialog"
		:transition="{ component: VFadeTransition }"
		:attach="attach"
		width="auto"
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
						<v-btn ref="submitBtn" color="green-darken-1" variant="text" @click="submit">
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
import { type VBtn, type VDialog, VFadeTransition } from 'vuetify/components';
import { useI18n } from 'vue-i18n';

const { maxWidth = '550px', width = '100%' } = defineProps<{
	maxWidth?: string | number;
	width?: string | number;
	title?: string;
	text?: string;
	attach?: VDialog['attach'];
	activator?: VDialog['activator'];
	submitLabel?: string;
	cancelLabel?: string;
	contentClass?: VDialog['contentClass'];
}>();

const emit = defineEmits<{
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

const confirmationDialog = defineModel<boolean>({
	default: false,
});

const submitBtn = ref<VBtn | null>(null);

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
