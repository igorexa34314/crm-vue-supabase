import { useSnackbarStore } from '@/stores/snackbar';
import { defineMutation, useMutation, useQueryCache } from '@pinia/colada';
import { useI18n } from 'vue-i18n';
import {
	updateInfo as apiUpdateInfo,
	updateAvatar as apiUpdateAvatar,
	type UserInfo,
} from '@/api/user';

export const useUpdateUserInfo = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	// const queryCache = useQueryCache();

	return useMutation({
		mutation: async ({ avatar, ...userdata }: Partial<UserInfo> & { avatar: File | null }) => {
			await apiUpdateInfo(userdata);
			if (avatar) {
				await apiUpdateAvatar(avatar);
			}
		},
		// onMutate: categoryData => {
		// 	// save the old value of categories
		// 	const oldCategories = queryCache.getQueryData<Category[]>(['categories']);

		// 	const newCategory: Category = { id: uuidV4(), ...categoryData };

		// 	// create a new array with the updated category
		// 	const newCategories = [newCategory, ...(oldCategories || [])];

		// 	// update the cache with the new categories
		// 	queryCache.setQueryData(['categories'], newCategories);

		// 	// we cancel (without refetching) all queries that depend on the categories
		// 	// to prevent them from updating the cache with an outdated value
		// 	queryCache.cancelQueries({ key: ['categories'] });

		// 	// pass the new category, old & new categories to the other hooks
		// 	// to handle rollbacks
		// 	return { oldCategories, newCategories, newCategory };
		// },
		// on both error and success
		// onSettled() {
		// 	// invalidate the query to refetch the new data
		// 	queryCache.invalidateQueries({ key: ['categories'] });
		// },
		onError: (error /* categoryData, { newCategories, oldCategories } */) => {
			// before applying the rollback, we need to check if the value in the cache
			// is the same because the cache could have been updated by another mutation
			// or query
			// if (newCategories === queryCache.getQueryData(['categories'])) {
			// 	queryCache.setQueryData(['categories'], oldCategories);
			// }

			// handle the error
			showMessage(
				te(error.message) ? t(error.message) : t('error_update_profile'),
				'red-darken-3'
			);
		},
		onSuccess: (/* category, categoryData, { newCategory } */) => {
			// update the category with the information from the server
			// since we are invalidating queries, this allows us to progressively
			// update the categories even if the user is submitting multiple mutations
			// successively
			// const categories = queryCache.getQueryData<Category[]>(['categories']) || [];

			// // replace the category we added in `onMutate()` with the one from the server
			// const newCategories = categories?.map(c => (c.id === newCategory.id ? category : c));

			// queryCache.setQueryData(['categories'], newCategories);

			showMessage(t('updateProfile_message'));
		},
	});
});
