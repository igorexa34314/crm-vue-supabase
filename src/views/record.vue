<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.newRecord') }}</h3>
		</div>

		<app-loader v-if="categoriesLoading" class="mt-10" page />

		<div v-else-if="!categories?.length" class="mt-10 text-center text-h6">
			{{ t('no_categories') + '. ' }}
			<router-link to="/categories">{{ t('create_category') }}</router-link>
		</div>

		<NewRecord v-else v-bind="{ categories, defaultAmount, loading: createLoading }" @create-record="create" />
	</div>
</template>

<script setup lang="ts">
import NewRecord from '@/components/record/NewRecord.vue';
import { ref, computed } from 'vue';
import { useAsyncState } from '@vueuse/core';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { useInfoStore } from '@/stores/info';
import { UserService } from '@/services/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { CategoryService } from '@/services/category';
import { RecordService, RecordForm } from '@/services/record';
import { DEFAULT_RECORD_AMOUNT as defaultAmount } from '@/globals';

useMeta({ title: 'pageTitles.newRecord' });

const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { showMessage } = useSnackbarStore();
const infoStore = useInfoStore();

const info = computed(() => infoStore.info);

const { state: categories, isLoading: categoriesLoading } = useAsyncState(CategoryService.fetchCategories, [], {
	onError: (e) => {
		showMessage(te(`firebase.messages.${e}`) ? t(`firebase.messages.${e}`) : t('error_load_categories'))
	}
});

const createLoading = ref(false);

const create = async (formData: RecordForm) => {
	try {
		createLoading.value = true;
		await RecordService.createRecord(formData);

		const { type, amount } = formData;
		const newBill = type === 'income' ?
			info.value!.bill + amount : info.value!.bill - amount;

		await UserService.updateInfo({ bill: +newBill.toFixed(2) });
		showMessage(t('createRecord_success'));
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(`firebase.messages.${e}`) ? t(`firebase.messages.${e}`) : e, 'red-darken-3');
		}
		else {
			showMessage(t('error_create_record'), 'red-darken-3');
		}
	}
	finally {
		createLoading.value = false;
	}
}
</script>
