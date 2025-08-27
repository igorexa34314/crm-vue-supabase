<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h6 mb-5 mb-sm-7 text-subtitle">{{ $t('edit') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="submitHandler">
			<v-select
				v-model="currentCategoryId"
				:items="categories"
				item-title="title"
				item-value="id"
				:label="$t('select_category')"
				variant="underlined"
				class="text-input" />

			<LocalizedInput
				v-model="categoryData.title"
				:rules="validations.title"
				variant="underlined"
				:label="$t('title')"
				class="mt-6"
				required />

			<LocalizedInput
				v-model="categoryData.limit"
				:rules="validations.limit"
				variant="underlined"
				type="number"
				:label="$t('limit') + ` (${userCurrency})`"
				class="mt-6"
				required />

			<div class="d-flex items-center">
				<v-btn
					color="success"
					type="submit"
					:class="$vuetify.display.xs ? 'mt-4' : 'mt-7'"
					:disabled="isNewCategoryEquals"
					:loading="loading">
					{{ $t('update') }}
					<v-icon :icon="mdiSend" class="ml-3" />
				</v-btn>

				<v-btn
					color="success"
					type="button"
					:class="$vuetify.display.xs ? 'mt-4' : 'mt-7'"
					class="ml-sm-6 ml-4"
					@click="confirmationDialog = true">
					{{ $t('delete') }}
					<v-icon :icon="mdiDelete" class="ml-3" />
				</v-btn>

				<DeleteCategoryDialog v-model="confirmationDialog" @delete-category="deleteCategory" />
			</div>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, watchEffect, watch, computed, useTemplateRef } from 'vue';
import { mdiSend, mdiDelete } from '@mdi/js';
import {
	updateCategory,
	deleteCategoryById,
	type Category,
	type CategoryData,
} from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { category as validations } from '@/utils/validations';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { storeToRefs } from 'pinia';
import deepEqual from 'deep-equal';
import { defaultCategoryLimit } from '@/constants/app';

const { categories, defaultLimit = defaultCategoryLimit } = defineProps<{
	categories: Category[];
	defaultLimit?: number;
}>();

const emit = defineEmits<{
	updated: [cat: Category];
	deleted: [categoryId: Category['id']];
}>();

const { t, te } = useI18n();
const { showMessage } = useSnackbarStore();
const cf = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());

const formRef = useTemplateRef('form');
const loading = ref(false);
const confirmationDialog = ref(false);

const currentCategoryId = ref<Category['id'] | undefined>(categories[0]?.id);

watch(
	() => categories.length,
	() => {
		currentCategoryId.value = categories[0]?.id;
	}
);

const categoryData = ref<CategoryData>({
	title: '',
	limit: Math.round(cf.value(defaultLimit) / 100) * 100,
});

watchEffect(() => {
	const category = categories.find(({ id }) => id === currentCategoryId.value)!;
	categoryData.value = { title: category.title, limit: cf.value(category.limit) };
});

const isNewCategoryEquals = computed(() => {
	const { title, limit } = categories.find(cat => cat.id === currentCategoryId.value)!;
	return deepEqual(categoryData.value, { title, limit: cf.value(limit) }, { strict: true });
});

const submitHandler = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid && currentCategoryId.value) {
		try {
			loading.value = true;
			const updatedCat = await updateCategory(currentCategoryId.value, {
				...categoryData.value,
				limit: cf.value(categoryData.value.limit, { type: 'reverse' }),
			});
			showMessage(t('category_updated'));
			emit('updated', updatedCat);
		} catch (e) {
			if (typeof e === 'string') {
				showMessage(te(e) ? t(e) : e.substring(0, 64), 'red-darken-3');
			} else {
				showMessage('error_update_category', 'red-darken-3');
			}
		} finally {
			loading.value = false;
		}
	}
};

const deleteCategory = async () => {
	if (!currentCategoryId.value) {
		return;
	}
	try {
		loading.value = true;
		await deleteCategoryById(currentCategoryId.value);
		emit('deleted', currentCategoryId.value);
	} catch (e) {
		if (typeof e === 'string') {
			showMessage(te(e) ? t(e) : e.substring(0, 64), 'red-darken-3');
		} else {
			showMessage('error_update_category', 'red-darken-3');
		}
	} finally {
		loading.value = false;
	}
};
</script>
