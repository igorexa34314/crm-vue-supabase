<template>
	<v-form ref="form" v-if="formState.category_id" @submit.prevent="submitHandler" class="record-form mt-8"
		:class="xs ? 'px-2' : 'px-4'">
		<v-select v-model="formState.category_id" :items="categories" item-title="title" item-value="id"
			:label="t('select_category')" variant="underlined" class="text-input" />

		<v-radio-group v-model="formState.type" class="mt-3 text-input">
			<v-radio v-for="tp in ['income', 'outcome']" :key="tp" :label="t(tp)" :value="tp" density="comfortable"
				color="radio" />
		</v-radio-group>

		<LocalizedInput v-model.number="formState.amount" :rules="validations.amount" type="number" variant="underlined"
			:label="t('amount') + ` (${info?.currency})`" class="mt-2" required />

		<LocalizedTextarea v-model="formState.description" :rules="validations.description" variant="underlined"
			:label="t('description')" class="mt-2" rows="1" auto-grow />

		<div class="mt-4">
			<div class="mb-3 text-subtitle">{{ t('record_details') }}</div>
			<LocalizedFileInput v-model="formState.details" :label="t('upload_details')" :rules="validations.details"
				variant="outlined" :placeholder="t('upload_details')" density="compact" style="max-width: 550px;" multiple />
		</div>

		<v-btn type="submit" color="success" :loading="loading" :class="xs ? 'mt-4' : 'mt-7'">
			{{ t('create') }}
			<v-icon :icon="mdiSend" class="ml-3" />
		</v-btn>
	</v-form>
</template>

<script setup lang="ts">
import LocalizedFileInput from '@/components/UI/LocalizedFileInput.vue';
import LocalizedTextarea from '@/components/UI/LocalizedTextarea.vue';
import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import { mdiSend } from '@mdi/js';
import { ref, computed, watchEffect } from 'vue';
import { Record, RecordForm } from '@/services/record';
import { VForm } from 'vuetify/components';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useI18n } from 'vue-i18n';
import { record as validations } from '@/utils/validations';
import { Category } from '@/services/category';
import { useInfoStore } from '@/stores/info';
import { useDisplay } from 'vuetify';
import { DEFAULT_CURRENCY, DEFAULT_RECORD_AMOUNT } from '@/globals';

const props = withDefaults(defineProps<{
	categories: Category[],
	defaultAmount?: number,
	defaultType?: Record['type'],
	loading?: boolean
}>(), {
	defaultAmount: DEFAULT_RECORD_AMOUNT,
	defaultType: 'outcome',
	loading: false
});

const emit = defineEmits<{
	createRecord: [data: Omit<RecordForm, 'date'>]
}>();
const { showMessage } = useSnackbarStore();
const { t, n } = useI18n({ inheritLocale: true, useScope: 'global' });
const { cf } = useCurrencyFilter();
const infoStore = useInfoStore();
const { xs } = useDisplay();

const info = computed(() => infoStore.info);

const form = ref<VForm>();

const formState = ref<RecordForm>({
	amount: Math.round(cf.value(props.defaultAmount) / 10) * 10,
	description: '',
	type: 'income',
	details: [],
	category_id: props.categories[0].id
});

watchEffect(() => {
	formState.value.category_id = props.categories[0].id;
	formState.value.amount = Math.round(cf.value(props.defaultAmount) / 10) * 10;
});
const canCreateRecord = computed(() => {
	return formState.value.type === 'income' ? true : cf.value(info.value!.bill) >= formState.value.amount;
});

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid && canCreateRecord.value) {
		const { amount, ...data } = formState.value;
		emit('createRecord', { ...data, amount: cf.value(amount, undefined, 'reverse') })
		resetForm();
	}
	else if (!canCreateRecord.value) {
		showMessage(t('lack_of_amount') +
			` (${n(formState.value.amount - cf.value(info.value!.bill), 'currency', info.value?.currency || DEFAULT_CURRENCY)})`);
	}
}
const resetForm = () => {
	formState.value.description = '';
	formState.value.amount = Math.round(cf.value(props.defaultAmount) / 10) * 10;
	formState.value.details = [];
}
</script>
