<template>
	<ConfirmationDialog>
		<div class="text-h6 text-center text-title mb-3">{{ $t('edit_record') }}</div>
		<v-form
			ref="form"
			@submit.prevent="submitHandler"
			id="update-record-form"
			class="record-form mt-8"
			:class="$vuetify.display.xs ? 'px-2' : 'px-4'">
			<LocalizedInput
				v-if="record.category"
				:model-value="record.category.title"
				variant="underlined"
				:label="$t('category')"
				class="mt-2"
				readonly />

			<v-radio-group v-model="formState.type" class="mt-2 text-input">
				<v-radio
					v-for="tp in recordTypes"
					:key="tp"
					:label="$t(tp)"
					:value="tp"
					density="comfortable"
					color="radio" />
			</v-radio-group>

			<LocalizedInput
				v-model.number="formState.amount"
				:rules="validations.amount"
				type="number"
				variant="underlined"
				:label="$t('amount') + ` (${info?.currency})`"
				class="mt-2"
				required />

			<LocalizedTextarea
				v-model="formState.description"
				:rules="validations.description"
				variant="underlined"
				:label="$t('description')"
				class="mt-2"
				rows="1"
				auto-grow />
		</v-form>
		<template #submit="{ submitEvent }">
			<v-btn
				type="submit"
				form="update-record-form"
				color="green-darken-1"
				variant="text"
				@click="submitEvent">
				<span class="text-h6">{{ $t('submit') }}</span>
			</v-btn>
		</template>
	</ConfirmationDialog>
</template>

<script setup lang="ts">
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue';
import LocalizedTextarea from '@/components/ui/LocalizedTextarea.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, computed, watchEffect, useTemplateRef } from 'vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { useI18n } from 'vue-i18n';
import { record as validations } from '@/utils/validations';
import { useUserStore } from '@/stores/user';
import { recordTypes } from '@/constants/app';
import type { RecordWithCategory, RecordDataToUpdate } from '@/api/record';

const { record } = defineProps<{
	record: RecordWithCategory;
	loading?: boolean;
}>();

const emit = defineEmits<{
	updateRecord: [data: RecordDataToUpdate];
}>();

const { showMessage } = useSnackbarStore();
const { t, n } = useI18n();
const cf = useCurrencyFilter();
const userStore = useUserStore();

const info = computed(() => userStore.info);

const formRef = useTemplateRef('form');
const formState = ref<RecordDataToUpdate>({
	amount: cf.value(record.amount),
	description: record.description,
	type: record.type,
});

watchEffect(() => {
	formState.value = {
		amount: cf.value(record.amount),
		description: record.description,
		type: record.type,
	};
});

const canUpdateRecord = computed(
	() =>
		info.value!.bill >=
		(formState.value.type === 'income' ? 1 : -1) *
			cf.value(formState.value.amount, { type: 'reverse' }) -
			record.amount
);

const submitHandler = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid && canUpdateRecord.value) {
		const { amount, ...data } = formState.value;
		emit('updateRecord', { ...data, amount: cf.value(amount, { type: 'reverse' }) });
		formRef.value?.reset();
	} else {
		showMessage(
			t('lack_of_amount') +
				` (${n(
					(formState.value.type === 'income' ? 1 : -1) *
						(cf.value(formState.value.amount, { type: 'reverse' }) - record.amount) -
						info.value!.bill,
					{
						key: 'currency',
						currency: info.value?.currency,
					}
				)})`,
			'red-darken-3'
		);
	}
};
</script>
