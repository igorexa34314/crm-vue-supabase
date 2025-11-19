import {
	createCategory as apiCreateCategory,
	updateCategory as apiUpdateCategory,
	deleteCategoryById as apiDeleteCategoryById,
	type Category,
	type CategoryData,
} from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { defineMutation, useMutation, useQueryCache } from '@pinia/colada';
import { useI18n } from 'vue-i18n';
import { v4 as uuidV4 } from 'uuid';

export const useCreateCategory = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const queryCache = useQueryCache();

	const { mutate, ...mutation } = useMutation({
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

			showMessage(t('category_updated'));
		},
	});

	return {
		...mutation,
		createCategory: mutate,
	};
});

export const useUpdateCategory = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const queryCache = useQueryCache();

	const { mutate, ...mutation } = useMutation({
		mutation: async ({ id, data }: { id: Category['id']; data: CategoryData }) => {
			return apiUpdateCategory(id, data);
		},
		onMutate: ({ id: categoryId, data: categoryData }) => {
			// save the old value of categories
			const oldCategories = queryCache.getQueryData<Category[]>(['categories']);

			const updatedCategory: Category = { id: categoryId, ...categoryData };

			// create a new array with the updated category
			const newCategories = oldCategories?.map(c => (c.id === categoryId ? updatedCategory : c));

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
		onSettled() {},
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
		updateCategory: mutate,
	};
});

export const useDeleteCategory = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const queryCache = useQueryCache();

	const { mutate, ...mutation } = useMutation({
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
		deleteCategory: mutate,
	};
});
