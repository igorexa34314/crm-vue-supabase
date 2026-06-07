<template>
	<ConfirmationDialog v-model="confirmDialog" @after-leave="resetForm">
		<div class="text-headline-small text-title mb-3 text-center">{{ $t('edit_record') }}</div>
		<v-form
			ref="form"
			@submit.prevent="submitHandler"
			id="update-record-form"
			class="mt-8"
			:class="xs ? 'px-2' : 'px-4'">
			<LocalizedInput
				v-if="record.category"
				:model-value="record.category.title"
				variant="underlined"
				:label="$t('category')"
				class="mt-2"
				readonly />

			<v-radio-group v-model="formState.type" class="text-input mt-2">
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
				:label="$t('amount') + ` (${userCurrency})`"
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
		<template #ok>
			<v-btn
				type="submit"
				:loading="loading"
				form="update-record-form"
				color="snackbar-success"
				variant="text">
				<span class="text-headline-small">{{ $t('submit') }}</span>
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
import { defaultBill, recordTypes } from '@/constants/app';
import { useDisplay } from 'vuetify';
import type { RecordWithCategory, RecordDataToUpdate } from '@/api/record';
import type { UserInfo } from '@/api/user';

const {
	userCurrency,
	bill = defaultBill,
	record,
	loading,
} = defineProps<{
	userCurrency: UserInfo['currency'];
	bill?: UserInfo['bill'];
	record: RecordWithCategory;
	loading?: boolean;
}>();

const emit = defineEmits<{
	updateRecord: [data: RecordDataToUpdate];
}>();

const { showErrorMessage } = useSnackbarStore();
const { t, n } = useI18n();
const { xs } = useDisplay();
const cf = useCurrencyFilter();

const confirmDialog = defineModel<boolean>();

const formRef = useTemplateRef('form');
const formState = ref<RecordDataToUpdate>({
	amount: cf(record.amount),
	description: record.description,
	type: record.type,
});

watchEffect(() => {
	formState.value = {
		amount: cf(record.amount),
		description: record.description,
		type: record.type,
	};
});

const canUpdateRecord = computed(
	() =>
		(bill ?? defaultBill) >=
		(formState.value.type === 'income' ? 1 : -1) *
			cf(formState.value.amount ?? 0, { type: 'reverse' }) -
			record.amount
);

const submitHandler = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid && canUpdateRecord.value) {
		const { amount, ...data } = formState.value;
		emit('updateRecord', { ...data, amount: cf(amount ?? 0, { type: 'reverse' }) });
	} else {
		showErrorMessage(
			t('lack_of_amount') +
				` (${n(
					(formState.value.type === 'income' ? 1 : -1) *
						(cf(formState.value.amount ?? 0, { type: 'reverse' }) - record.amount) -
						(bill ?? defaultBill),
					{
						key: 'currency',
						currency: userCurrency,
					}
				)})`
		);
	}
};

const resetForm = () => {
	formRef.value?.reset();
};
</script>
