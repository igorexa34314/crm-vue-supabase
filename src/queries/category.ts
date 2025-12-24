import { fetchCategories, fetchCategoriesSpendStats } from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { defineQuery, useQuery } from '@pinia/colada';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

export const useCategoriesQuery = defineQuery(() => {
	const { t, te } = useI18n({ useScope: 'global' });
	const { showMessage } = useSnackbarStore();

	const query = useQuery({
		key: ['categories'],
		query: fetchCategories,
	});

	watch(query.error, e => {
		if (e) {
			showMessage(
				te(`warnings.${e.message}`) ? t(`warnings.${e.message}`) : t('error_load_categories'),
				'red-darken-3'
			);
		}
	});

	return query;
});

export const useCategoriesSpendStatsQuery = defineQuery(() => {
	const { te, t } = useI18n({ useScope: 'global' });
	const { showMessage } = useSnackbarStore();

	const query = useQuery({
		key: ['catStats'],
		query: fetchCategoriesSpendStats,
	});

	watch(query.error, e => {
		if (e) {
			showMessage(
				te(`warnings.${e.message}`) ? t(`warnings.${e.message}`) : e.message,
				'red-darken-3'
			);
		}
	});

	return query;
});
