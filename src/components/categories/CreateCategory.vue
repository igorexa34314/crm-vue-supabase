<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h5 mb-3 mb-sm-7 text-subtitle">{{ $t('create') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="createCategory">
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
import {
	createCategory as apiCreateCategory,
	type Category,
	type CategoryData,
} from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { category as validations } from '@/utils/validations';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { defaultCategoryLimit } from '@/constants/app';
import { defineMutation, useMutation, useQueryCache } from '@pinia/colada';
import { v4 as uuidV4 } from 'uuid';

const { defaultLimit = defaultCategoryLimit } = defineProps<{
	defaultLimit?: number;
}>();

const { t, te } = useI18n();

const cf = useCurrencyFilter();
const { showMessage } = useSnackbarStore();

const { userCurrency } = storeToRefs(useUserStore());
const formRef = useTemplateRef('form');
const loading = ref(false);

const formState = ref<CategoryData>({
	title: '',
	limit: Math.floor(cf.value(defaultLimit) / 10) * 10,
});

const queryCache = useQueryCache();

const useCreateCategory = defineMutation(() => {
	const { mutate, status, ...mutation } = useMutation({
		mutation: (categoryData: CategoryData) => apiCreateCategory(categoryData),
		onMutate: categoryData => {
			// save the old value of categories
			const oldCategories = queryCache.getQueryData<Category[]>(['categories']);

			const newCategory: Category = { id: uuidV4(), ...categoryData };

			// create a new array with the updated category
			const newCategories = [newCategory, ...(oldCategories || [])];

			// update the cache with the new categories
			queryCache.setQueryData(['categories'], newCategories);

			// we cancel (without refetching) all queries that depend on the categories
			// to prevent them from updating the cache with an outdated value
			queryCache.cancelQueries({ key: ['categories'] });

			// pass the new category, old & new categories to the other hooks
			// to handle rollbacks
			return { oldCategories, newCategories, newCategory };
		},
		// on both error and success
		onSettled() {
			// invalidate the query to refetch the new data
			queryCache.invalidateQueries({ key: ['categories'] });
		},
		onError: (error, categoryData, { newCategories, oldCategories }) => {
			// before applying the rollback, we need to check if the value in the cache
			// is the same because the cache could have been updated by another mutation
			// or query
			if (newCategories === queryCache.getQueryData(['categories'])) {
				queryCache.setQueryData(['categories'], oldCategories);
			}

			// handle the error
			showMessage(
				te(error.message) ? t(error.message) : t('error_create_category'),
				'red-darken-3'
			);
		},
		onSuccess: (category, categoryData, { newCategory }) => {
			// update the category with the information from the server
			// since we are invalidating queries, this allows us to progressively
			// update the categories even if the user is submitting multiple mutations
			// successively
			const categories = queryCache.getQueryData<Category[]>(['categories']) || [];

			// replace the category we added in `onMutate()` with the one from the server
			const newCategories = categories?.map(c => (c.id === newCategory.id ? category : c));

			queryCache.setQueryData(['categories'], newCategories);

			formRef.value?.reset();
			formState.value.limit = Math.floor(cf.value(defaultLimit) / 100) * 100;

			showMessage(t('category_updated'));
		},
	});

	return {
		...mutation,
		createCategory: async () => {
			const valid = (await formRef.value?.validate())?.valid;
			if (valid) {
				const { limit, ...data } = formState.value;

				mutate({
					...data,
					limit: cf.value(limit, { type: 'reverse' }),
				});
			}
		},
		createCategoryStatus: status,
	};
});

const { createCategory, createCategoryStatus } = useCreateCategory();
</script>
