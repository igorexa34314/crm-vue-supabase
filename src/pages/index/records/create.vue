<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">
				{{ $t('pageTitles.newRecord') }}
			</h3>
		</div>

		<app-loader v-if="categoriesLoading" class="mt-10" page />

		<div v-else-if="!categories.length" class="mt-10 text-center text-h6">
			{{ $t('no_categories') + '. ' }}
			<router-link to="/categories">{{ $t('create_category') }}</router-link>
		</div>

		<CreateRecord
			v-else
			v-bind="{ categories, defaultRecordAmount, loading: createLoading }"
			@create-record="handleRecordCreate" />
	</div>
</template>

<script setup lang="ts">
import CreateRecord from '@/components/record/CreateRecord.vue';
import { ref } from 'vue';
import { useAsyncState } from '@vueuse/core';
import { useSeoMeta } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { fetchCategories } from '@/api/category';
import { createRecord, type RecordForm } from '@/api/record';
import { defaultRecordAmount } from '@/constants/app';

useSeoMeta({ title: 'pageTitles.newRecord' });

const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();

const { state: categories, isLoading: categoriesLoading } = useAsyncState(fetchCategories, [], {
	onError: e => {
		showMessage(
			te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_load_categories'),
			'red-darken-3'
		);
	},
});

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
