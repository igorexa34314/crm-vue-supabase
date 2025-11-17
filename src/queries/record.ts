import { fetchRecordById } from '@/api/record';
import { useSnackbarStore } from '@/stores/snackbar';
import { defineQuery, useQuery } from '@pinia/colada';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

export const useRecordByIdQuery = defineQuery(() => {
	const route = useRoute('//records/[id]');
	const { showMessage } = useSnackbarStore();

	const query = useQuery({
		key: () => ['record', route.params.id],
		query: () => fetchRecordById(route.params.id),
	});

	watch(query.error, e => {
		if (e) {
			showMessage('no_record_found', 'red-darken-3');
		}
	});

	return query;
});
