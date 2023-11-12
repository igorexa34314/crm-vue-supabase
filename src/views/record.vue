<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.newRecord') }}</h3>
		</div>

		<app-loader v-if="categoriesLoading" class="mt-10" page />

		<div v-else-if="!categories.length" class="mt-10 text-center text-h6">
			{{ t('no_categories') + '. ' }}
			<router-link to="/categories">{{ t('create_category') }}</router-link>
		</div>

		<CreateRecord
			v-else
			v-bind="{ categories, defaultAmount, loading: createLoading }"
			@create-record="createRecord" />
	</div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { useAsyncState } from '@vueuse/core';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { CategoryService } from '@/services/category';
import { RecordService, type RecordForm } from '@/services/record';
import { DEFAULT_RECORD_AMOUNT as defaultAmount } from '@/global-vars';

useMeta({ title: 'pageTitles.newRecord' });

const CreateRecord = defineAsyncComponent(() => import('@/components/record/CreateRecord.vue'));

const { t, te } = useI18n({ useScope: 'global' });
const { showMessage } = useSnackbarStore();

const { state: categories, isLoading: categoriesLoading } = useAsyncState(CategoryService.fetchCategories, [], {
	onError: e => {
		showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_load_categories'), 'red-darken-3');
	},
});

const createLoading = ref(false);

const createRecord = async (formData: RecordForm) => {
	try {
		createLoading.value = true;
		await RecordService.createRecord(formData);
		showMessage(t('createRecord_success'));
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : e.substring(0, 64), 'red-darken-3');
		} else {
			showMessage(t('error_create_record'), 'red-darken-3');
		}
	} finally {
		createLoading.value = false;
	}
};
</script>
