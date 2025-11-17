<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h6 mb-5 mb-sm-7 text-subtitle">{{ $t('edit') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="updateCategory">
			<v-select
				v-model="currentCategoryId"
				:items="categories"
				item-title="title"
				item-value="id"
				:label="$t('select_category')"
				variant="underlined"
				class="text-input" />

			<LocalizedInput
				v-model="categoryData.title"
				:rules="validations.title"
				variant="underlined"
				:label="$t('title')"
				class="mt-6"
				required />

			<LocalizedInput
				v-model="categoryData.limit"
				:rules="validations.limit"
				variant="underlined"
				type="number"
				:label="$t('limit') + ` (${userCurrency})`"
				class="mt-6"
				required />

			<div class="d-flex items-center">
				<v-btn
					color="success"
					type="submit"
					:class="$vuetify.display.xs ? 'mt-4' : 'mt-7'"
					:disabled="isNewCategoryEquals"
					:loading="updateCategoryStatus === 'pending'">
					{{ $t('update') }}
					<v-icon :icon="mdiSend" class="ml-3" />
				</v-btn>

				<v-btn
					color="success"
					type="button"
					:class="$vuetify.display.xs ? 'mt-4' : 'mt-7'"
					class="ml-sm-6 ml-4"
					@click="confirmationDialog = true">
					{{ $t('delete') }}
					<v-icon :icon="mdiDelete" class="ml-3" />
				</v-btn>

				<DeleteCategoryDialog v-model="confirmationDialog" @delete-category="deleteCategory" />
			</div>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, watchEffect, watch, computed, useTemplateRef } from 'vue';
import { mdiSend, mdiDelete } from '@mdi/js';
import {
	updateCategory as apiUpdateCategory,
	deleteCategoryById as apiDeleteCategoryById,
	type Category,
	type CategoryData,
} from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { category as validations } from '@/utils/validations';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { storeToRefs } from 'pinia';
import deepEqual from 'deep-equal';
import { defaultCategoryLimit } from '@/constants/app';
import { defineMutation, useMutation, useQueryCache } from '@pinia/colada';

const { categories, defaultLimit = defaultCategoryLimit } = defineProps<{
	categories: Category[];
	defaultLimit?: number;
}>();

const { t, te } = useI18n();
const { showMessage } = useSnackbarStore();
const cf = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());

const formRef = useTemplateRef('form');
const confirmationDialog = ref(false);

const currentCategoryId = ref<Category['id'] | undefined>(categories[0]?.id);

watch(
	() => categories.length,
	() => {
		currentCategoryId.value = categories[0]?.id;
	}
);

const categoryData = ref<CategoryData>({
	title: '',
	limit: Math.round(cf.value(defaultLimit) / 100) * 100,
});

watchEffect(() => {
	const category = categories.find(({ id }) => id === currentCategoryId.value)!;
	categoryData.value = { title: category.title, limit: cf.value(category.limit) };
});

const isNewCategoryEquals = computed(() => {
	const { title, limit } = categories.find(cat => cat.id === currentCategoryId.value)!;
	return deepEqual(categoryData.value, { title, limit: cf.value(limit) }, { strict: true });
});

const queryCache = useQueryCache();

const useUpdateCategory = defineMutation(() => {
	const { mutate, status, ...mutation } = useMutation({
		mutation: (categoryData: CategoryData) =>
			apiUpdateCategory(currentCategoryId.value!, categoryData),
		onMutate: categoryData => {
			// save the old value of categories
			const oldCategories = queryCache.getQueryData<Category[]>(['categories']);

			const updatedCategory: Category = { id: currentCategoryId.value!, ...categoryData };

			// create a new array with the updated category
			const newCategories = oldCategories?.map(c =>
				c.id === currentCategoryId.value ? updatedCategory : c
			);

			// update the cache with the new categories
			queryCache.setQueryData(['categories'], newCategories);

			// we cancel (without refetching) all queries that depend on the categories
			// to prevent them from updating the cache with an outdated value
			queryCache.cancelQueries({ key: ['categories'] });

			// pass the updated, old & new categories to the other hooks
			// to handle rollbacks
			return { oldCategories, newCategories, updatedCategory };
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
				te(error.message) ? t(error.message) : t('error_update_category'),
				'red-darken-3'
			);
		},
		onSuccess: category => {
			// update the category with the information from the server
			// since we are invalidating queries, this allows us to progressively
			// update the categories even if the user is submitting multiple mutations
			// successively
			const categories = queryCache.getQueryData<Category[]>(['categories']) || [];

			// replace the category we added in `onMutate()` with the one from the server
			const newCategories = categories?.map(c => (c.id === category.id ? category : c));

			queryCache.setQueryData(['categories'], newCategories);

			showMessage(t('category_updated'));
		},
	});

	return {
		...mutation,
		updateCategory: async () => {
			const valid = (await formRef.value?.validate())?.valid;
			if (valid && currentCategoryId.value) {
				mutate(categoryData.value);
			}
		},
		updateCategoryStatus: status,
	};
});

const useDeleteCategory = defineMutation(() => {
	const { mutate, status, ...mutation } = useMutation({
		mutation: (categoryId: Category['id']) => apiDeleteCategoryById(categoryId),
		onMutate: categoryId => {
			// save the old value of categories
			const oldCategories = queryCache.getQueryData<Category[]>(['categories']);

			// create a new array without the deleted category
			const newCategories = oldCategories?.filter(cat => cat.id !== categoryId);

			// update the cache with the new categories
			queryCache.setQueryData(['categories'], newCategories);

			// we cancel (without refetching) all queries that depend on the categories
			// to prevent them from updating the cache with an outdated value
			queryCache.cancelQueries({ key: ['categories'] });

			// pass the old & new categories to the other hooks
			// to handle rollback
			return { oldCategories, newCategories };
		},
		onSettled() {
			// invalidate the query to refetch the new data
			queryCache.invalidateQueries({ key: ['categories'] });
		},
		onError: (error, categoryId, { newCategories, oldCategories }) => {
			// before applying the rollback, we need to check if the value in the cache
			// is the same because the cache could have been updated by another mutation
			// or query
			if (newCategories === queryCache.getQueryData(['categories'])) {
				queryCache.setQueryData(['categories'], oldCategories);
			}

			// handle the error
			showMessage(
				te(error.message) ? t(error.message) : t('error_update_category'),
				'red-darken-3'
			);
		},
		onSuccess: () => {
			showMessage(t('category_updated'));
		},
	});

	return {
		...mutation,
		deleteCategory: () => {
			if (currentCategoryId.value) {
				mutate(currentCategoryId.value);
			}
		},
		deleteCategoryStatus: status,
	};
});

const { updateCategory, updateCategoryStatus } = useUpdateCategory();
const { deleteCategory, deleteCategoryStatus } = useDeleteCategory();
</script>
