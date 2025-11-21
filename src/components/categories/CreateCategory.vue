<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h5 mb-3 mb-sm-7 text-subtitle">{{ $t('create') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="tryCreateCategory">
			<LocalizedInput
				v-model="formState.title"
				:rules="validations.title"
				variant="underlined"
				:label="$t('title')"
				required />

			<LocalizedInput
				v-model.number="formState.limit"
				:rules="validations.limit"
				variant="underlined"
				type="number"
				:label="$t('limit') + ` (${userCurrency})`"
				class="mt-6"
				required />

			<v-btn
				color="success"
				type="submit"
				:class="$vuetify.display.xs ? 'mt-4' : 'mt-7'"
				:loading="loading">
				{{ $t('create') }}
				<v-icon :icon="mdiSend" class="ml-3" />
			</v-btn>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { mdiSend } from '@mdi/js';
import { ref, useTemplateRef } from 'vue';
import { type CategoryData } from '@/api/category';
import { category as validations } from '@/utils/validations';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { defaultCategoryLimit } from '@/constants/app';
import { useCreateCategory } from '@/mutations/category';

const { defaultLimit = defaultCategoryLimit } = defineProps<{
	defaultLimit?: number;
}>();

const cf = useCurrencyFilter();

const { userCurrency } = storeToRefs(useUserStore());
const formRef = useTemplateRef('form');
const loading = ref(false);

const formState = ref<CategoryData>({
	title: '',
	limit: Math.floor(cf.value(defaultLimit) / 10) * 10,
});

const { mutateAsync: createCategory } = useCreateCategory();

const tryCreateCategory = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid) {
		const { limit, ...data } = formState.value;

		await createCategory({
			...data,
			limit: cf.value(limit, { type: 'reverse' }),
		});
		formRef.value?.reset();
		formState.value.limit = Math.floor(cf.value(defaultLimit) / 100) * 100;
	}
};
</script>
