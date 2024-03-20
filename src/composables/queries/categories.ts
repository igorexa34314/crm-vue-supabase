import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import { watch } from 'vue';
import {
	fetchCategories,
	createCategory,
	fetchCategoriesSpendStats,
	type CategorySpendStats,
	type Category,
	type CategoryData,
} from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';

export const useFetchCategories = () => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const query = useQuery<Category[], Error>({
		queryKey: ['categories'],
		queryFn: fetchCategories,
		initialData: [],
	});

	watch(
		query.isFetching,
		val => {
			console.log(val);
		},
		{ immediate: true }
	);

	watch(query.error, error => {
		if (error) {
			showMessage(
				te(`warnings.${error.message}`) ? t(`warnings.${error.message}`) : t('error_load_categories'),
				'red-darken-3'
			);
		}
	});

	return query;
};

export const useFetchCategoriesSpendStats = () => {
	const { showMessage } = useSnackbarStore();

	const query = useQuery<CategorySpendStats[], Error>({
		queryKey: ['categories', 'stats'],
		queryFn: fetchCategoriesSpendStats,
		initialData: [],
	});

	watch(query.error, () => {
		showMessage('error_loading_records_or_categories', 'red-darken-3');
	});

	return query;
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	return useMutation<Category, Error, CategoryData>({
		mutationFn: createCategory,

		onSuccess: () => {
			showMessage(t('category_created'));
		},
		onError: err => {
			showMessage(te(err.message) ? t(err.message) : err.message.substring(0, 64), 'red-darken-3');
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
	});
};
