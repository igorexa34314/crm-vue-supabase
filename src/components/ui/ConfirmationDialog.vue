<template>
	<v-dialog
		v-model="confirmationDialog"
		:transition="{ component: VFadeTransition }"
		:attach="attach"
		width="auto"
		content-class="w-100"
		@after-leave="$emit('afterLeave')">
		<template #activator="slotProps">
			<slot name="activator" v-bind="slotProps"></slot>
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
					<slot name="cancel">
						<v-btn color="red-darken-1" variant="text" @click="cancel">
							<span class="text-h6">{{ cancelLabel || $t('cancel') }}</span>
						</v-btn>
					</slot>
					<slot name="ok">
						<v-btn
							ref="submitBtn"
							:loading="loading"
							color="green-darken-1"
							variant="text"
							@click="ok">
							<span class="text-h6">{{ okLabel || $t('submit') }}</span>
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

const {
	maxWidth = '550px',
	width = '100%',
	title,
	text,
	okLabel,
	cancelLabel,
	contentClass,
	loading,
} = defineProps<{
	maxWidth?: string | number;
	width?: string | number;
	title?: string;
	text?: string;
	attach?: VDialog['attach'];
	activator?: VDialog['activator'];
	okLabel?: string;
	cancelLabel?: string;
	contentClass?: unknown;
	loading?: boolean;
}>();

const emit = defineEmits<{
	ok: [];
	cancel: [];
	afterLeave: [];
}>();

const slots = defineSlots<{
	title: VDialog['$slots']['default'];
	default: VDialog['$slots']['default'];
	activator: VDialog['$slots']['activator'];
	cancel(): unknown;
	ok(): unknown;
}>();

const confirmationDialog = defineModel<boolean>();

const submitBtn = ref<VBtn | null>(null);

watch(
	confirmationDialog,
	newVal => {
		if (newVal) {
			nextTick(() => {
				(submitBtn.value?.$el as HTMLButtonElement | null)?.focus();
			});
		}
	},
	{ flush: 'post' }
);

const cancel = () => {
	confirmationDialog.value = false;
	emit('cancel');
};
const ok = () => {
	emit('ok');
};
</script>
