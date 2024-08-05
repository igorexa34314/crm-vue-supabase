<template>
	<v-form
		ref="form"
		v-if="categories.length"
		@submit.prevent="submitHandler"
		class="record-form mt-8"
		:class="$vuetify.display.xs ? 'px-2' : 'px-4'">
		<v-select
			v-model="formState.category_id"
			:items="categories"
			item-title="title"
			item-value="id"
			:label="$t('select_category')"
			variant="underlined"
			class="text-input" />

		<v-radio-group v-model="formState.type" class="mt-3 text-input">
			<v-radio v-for="tp in recordTypes" :key="tp" :label="$t(tp)" :value="tp" density="comfortable" color="radio" />
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

		<div class="mt-4">
			<div class="mb-3 text-subtitle">{{ $t('record_details') }}</div>
			<LocalizedFileInput
				v-model="formState.details"
				:label="$t('upload_details')"
				:rules="validations.details"
				variant="outlined"
				:placeholder="$t('upload_details')"
				density="compact"
				style="max-width: 550px"
				multiple />
		</div>

		<v-btn type="submit" color="success" :loading="loading" :class="$vuetify.display.xs ? 'mt-4' : 'mt-7'">
			{{ $t('create') }}
			<v-icon :icon="mdiSend" class="ml-3" />
		</v-btn>
	</v-form>
</template>

<script setup lang="ts">
import LocalizedFileInput from '@/components/ui/LocalizedFileInput.vue';
import LocalizedTextarea from '@/components/ui/LocalizedTextarea.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { mdiSend } from '@mdi/js';
import { ref, computed, watchEffect } from 'vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useI18n } from 'vue-i18n';
import { record as validations } from '@/utils/validations';
import { useUserStore } from '@/stores/user';
import { defaultRecordAmount, defaultBill, recordTypes } from '@/constants/app';
import { serverCurrency } from '@/constants/currency';
import type { VForm } from 'vuetify/components';
import type { Category } from '@/api/category';
import type { Record, RecordForm } from '@/api/record';

const {
	categories,
	defaultAmount = defaultRecordAmount,
	defaultType = 'outcome',
	loading,
} = defineProps<{
	categories: Category[];
	defaultAmount?: number;
	defaultType?: Record['type'];
	loading?: boolean;
}>();

const emit = defineEmits<{
	createRecord: [data: RecordForm];
}>();

const { showMessage } = useSnackbarStore();
const { t, n } = useI18n();
const cf = useCurrencyFilter();
const userStore = useUserStore();

const info = computed(() => userStore.info);

const form = ref<VForm | null>(null);

const defaultFormValues = {
	amount: Math.round(cf.value(defaultAmount) / 10) * 10,
	description: '',
	type: defaultType,
	details: [],
	category_id: categories[0].id,
};

const formState = ref<RecordForm>({ ...defaultFormValues, details: [] });

watchEffect(() => {
	formState.value.category_id = categories[0].id;
	formState.value.amount = Math.round(cf.value(defaultAmount) / 10) * 10;
});
const canCreateRecord = computed(
	() => formState.value.type === 'income' || cf.value(info.value!.bill) >= formState.value.amount
);

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid && canCreateRecord.value) {
		const { amount, ...data } = formState.value;
		emit('createRecord', { ...data, amount: cf.value(amount, { type: 'reverse' }) });
		resetForm();
	} else {
		showMessage(
			t('lack_of_amount') +
				` (${n(formState.value.amount - cf.value(info.value?.bill || defaultBill), {
					key: 'currency',
					currency: info.value?.currency || serverCurrency,
				})})`,
			'red-darken-3'
		);
	}
};
const resetForm = () => {
	formState.value = { ...defaultFormValues, details: [] };
};
</script>
