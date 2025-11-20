import { useSnackbarStore } from '@/stores/snackbar';
import { defineMutation, useMutation, useQueryCache } from '@pinia/colada';
import { useI18n } from 'vue-i18n';
import {
	createRecord as apiCreateRecord,
	deleteRecordById as apiDeleteRecordById,
	updateRecord as apiUpdateRecord,
	type Record,
	type RecordDataToUpdate,
	type RecordWithDetails,
} from '@/api/record';

export const useCreateRecord = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const queryCache = useQueryCache();

	return useMutation({
		mutation: apiCreateRecord,

		// on both error and success
		onSettled() {
			// invalidate the query to refetch the new data
			queryCache.invalidateQueries({ key: ['records'] });
		},
		onError: error => {
			// handle the error
			showMessage(
				te(error.message) ? t(error.message) : t('error_create_record'),
				'red-darken-3'
			);
		},
		onSuccess: () => {
			showMessage(t('createRecord_success'));
		},
	});
});

export const useUpdateRecord = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const queryCache = useQueryCache();

	return useMutation({
		mutation: async ({ id, data }: { id: Record['id']; data: RecordDataToUpdate }) => {
			return apiUpdateRecord(id, data);
		},
		onMutate: ({ id: recordId, data: recordData }) => {
			// get the current record from the cache, we assume it exists
			const oldRecord = queryCache.getQueryData<RecordWithDetails>(['record', { id: recordId }]);
			const newRecord = {
				// we merge both objects to have a complete record
				...oldRecord,
				...recordData,
			} as RecordWithDetails;

			// update the cache with the new record
			queryCache.setQueryData(['record', { id: recordId }], newRecord);
			// we cancel (without refetching) all queries that depend on the record
			queryCache.cancelQueries({ key: ['record', { id: recordId }] });

			// pass the old and new record to the other hooks
			return { oldRecord, newRecord };
		},
		onSettled(_data, _, __, { newRecord }) {
			// `newRecord` can be undefined if the `onMutate` hook fails
			if (newRecord) {
				// invalidate the query to refetch the new data
				queryCache.invalidateQueries({ key: ['record', { id: newRecord.id }] });
			}
		},
		onError: (error, { id: recordId }, { newRecord, oldRecord }) => {
			// before applying the rollback, we need to check if the value in the cache
			// is the same because the cache could have been updated by another mutation
			// or query
			if (newRecord === queryCache.getQueryData(['record', { id: recordId }])) {
				queryCache.setQueryData(['record', { id: recordId }], oldRecord);
			}

			// handle the error
			showMessage(
				te(error.message) ? t(error.message) : t('error_update_record'),
				'red-darken-3'
			);
		},
		onSuccess: (record, _, { newRecord }) => {
			// update the record with the information from the server
			// since we are invalidating queries, this allows us to progressively
			queryCache.setQueryData(['record', { id: newRecord.id }], record);

			showMessage(t('record_updated_succesfully'));
		},
	});
});

export const useDeleteRecord = defineMutation(() => {
	const { t, te } = useI18n();
	const { showMessage } = useSnackbarStore();

	const queryCache = useQueryCache();

	return useMutation({
		mutation: apiDeleteRecordById,
		onSettled(_, __, recordId) {
			// invalidate the query to refetch the new data
			queryCache.invalidateQueries({ key: ['records'] });
			queryCache.invalidateQueries({ key: ['record', { id: recordId }] });
		},
		onError: error => {
			// handle the error
			showMessage(
				te(error.message) ? t(error.message) : t('error_delete_record'),
				'red-darken-3'
			);
		},
		onSuccess: () => {
			showMessage(t('record_deleted_succesfully'));
		},
	});
});
