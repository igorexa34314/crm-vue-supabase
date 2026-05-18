import { fetchCategories, fetchCategoriesSpendStats } from '@/api/category';
import { defineQuery, defineQueryOptions, useQuery, useQueryState } from '@pinia/colada';
import { useI18n } from 'vue-i18n';

export const categoriesQuery = defineQueryOptions({
	key: ['categories'],
	query: fetchCategories,
});

export const useCategoriesQuery = defineQuery(() => {
	const { t, te } = useI18n({ useScope: 'global' });

	return useQuery({
		...categoriesQuery,
		meta: {
			errorMessage: e =>
				te(`warnings.${e.message}`) ? t(`warnings.${e.message}`) : t('error_load_categories'),
		},
	});
});

export function useCategoriesQueryState() {
	return useQueryState(categoriesQuery.key);
}

export const categoriesSpendStatsQuery = defineQueryOptions({
	key: ['catStats'],
	query: fetchCategoriesSpendStats,
});

export const useCategoriesSpendStatsQuery = defineQuery(() => {
	return useQuery(categoriesSpendStatsQuery);
});

export function useCategoriesSpendStatsQueryState() {
	return useQueryState(categoriesSpendStatsQuery.key);
}
