import { useSnackbarStore } from '@/stores/snackbar';
import { defineMutation, useMutation } from '@pinia/colada';
import { useI18n } from 'vue-i18n';
import {
	changeUserPassword as apiChangeUserPassword,
	changeUserEmail as apiChangeUserEmail,
} from '@/api/auth';

export const useChangeUserPassword = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	return useMutation({
		mutation: async ({ oldPass, newPass }: { oldPass: string; newPass: string }) => {
			return apiChangeUserPassword(oldPass, newPass);
		},
		onError: error => {
			// handle the error
			showMessage(
				te(`warnings.${error.name}`) ? t(`warnings.${error.name}`) : t('error_update_profile'),
				'red-darken-3'
			);
		},
		onSuccess: () => {
			showMessage(t('updatePass_message'));
		},
	});
});

export const useChangeUserEmail = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	return useMutation({
		mutation: async (newEmail: string) => {
			return apiChangeUserEmail(newEmail);
		},
		onError: error => {
			// handle the error
			showMessage(
				te(`warnings.${error.name}`) ? t(`warnings.${error.name}`) : t('error_update_profile'),
				'red-darken-3'
			);
		},
		onSuccess: () => {
			showMessage(t('updateEmail_message'));
		},
	});
});
