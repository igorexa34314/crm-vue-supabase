<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.newRecord') }}</h3>
		</div>

		<app-loader v-if="isFetching" class="mt-10" page />

		<div v-else-if="!categories.length" class="mt-10 text-center text-h6">
			{{ t('no_categories') + '. ' }}
			<router-link to="/categories">{{ t('create_category') }}</router-link>
		</div>

		<CreateRecord
			v-else
			v-bind="{ categories, defaultAmount, loading: createLoading }"
			@create-record="handleRecordCreate" />
	</div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { useHead } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { createRecord, type RecordForm } from '@/api/record';
import { DEFAULT_RECORD_AMOUNT as defaultAmount } from '@/global-vars';
import { useFetchCategories } from '@/composables/queries/categories';

useHead({ title: 'pageTitles.newRecord' });

const CreateRecord = defineAsyncComponent(() => import('@/components/record/CreateRecord.vue'));

const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();

const { data: categories, isFetching } = useFetchCategories();

const createLoading = ref(false);

const handleRecordCreate = async (formData: RecordForm) => {
	try {
		createLoading.value = true;
		await createRecord(formData);
		showMessage(t('createRecord_success'));
	} catch (e) {
		showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_create_record'), 'red-darken-3');
	} finally {
		createLoading.value = false;
	}
};
</script>
