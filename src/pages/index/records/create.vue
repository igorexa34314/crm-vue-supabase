<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">
				{{ $t('pageTitles.newRecord') }}
			</h3>
		</div>

		<app-loader v-if="categoriesState.status === 'pending'" class="mt-10" page />

		<div
			v-else-if="categoriesState.status === 'success' && !categoriesState.data.length"
			class="mt-10 text-center text-h6">
			{{ $t('no_categories') + '. ' }}
			<router-link to="/categories">{{ $t('create_category') }}</router-link>
		</div>

		<CreateRecord
			v-else-if="categoriesState.status === 'success'"
			:categories="categoriesState.data"
			:default-amount="defaultRecordAmount"
			:loading="createLoading"
			@create-record="handleRecordCreate" />
	</div>
</template>

<script setup lang="ts">
import CreateRecord from '@/components/record/CreateRecord.vue';
import { ref } from 'vue';
import { useSeoMeta } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { createRecord, type RecordForm } from '@/api/record';
import { defaultRecordAmount } from '@/constants/app';
import { useCategoriesQuery } from '@/queries/categories';

useSeoMeta({ title: 'pageTitles.newRecord' });

const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();

const { state: categoriesState } = useCategoriesQuery();

const createLoading = ref(false);

const handleRecordCreate = async (formData: RecordForm) => {
	try {
		createLoading.value = true;
		await createRecord(formData);
		showMessage(t('createRecord_success'));
	} catch (e) {
		showMessage(
			te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_create_record'),
			'red-darken-3'
		);
	} finally {
		createLoading.value = false;
	}
};
</script>
