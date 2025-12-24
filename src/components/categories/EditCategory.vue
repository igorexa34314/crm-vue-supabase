<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h6 mb-5 mb-sm-7 text-subtitle">{{ $t('edit') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="tryUpdateCategory">
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
					:loading="updateCategoryAsyncStatus === 'loading'">
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

				<DeleteCategoryDialog
					v-model="confirmationDialog"
					:loading="deleteCategoryAsyncStatus === 'loading'"
					@delete-category="tryDeleteCategory" />
			</div>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import DeleteCategoryDialog from '@/components/categories/DeleteCategoryDialog.vue';
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { ref, watchEffect, watch, computed, useTemplateRef } from 'vue';
import { mdiSend, mdiDelete } from '@mdi/js';
import { type Category, type CategoryData } from '@/api/category';
import { category as validations } from '@/utils/validations';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { storeToRefs } from 'pinia';
import deepEqual from 'deep-equal';
import { defaultCategoryLimit } from '@/constants/app';
import { useDeleteCategory, useUpdateCategory } from '@/mutations/category';

const { categories, defaultLimit = defaultCategoryLimit } = defineProps<{
	categories: Category[];
	defaultLimit?: number;
}>();

const cf = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());

const formRef = useTemplateRef('form');
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
	limit: Math.round(cf(defaultLimit) / 100) * 100,
});

watchEffect(() => {
	const category = categories.find(({ id }) => id === currentCategoryId.value)!;
	categoryData.value = { title: category.title, limit: cf(category.limit) };
});

const isNewCategoryEquals = computed(() => {
	const { title, limit } = categories.find(cat => cat.id === currentCategoryId.value)!;
	return deepEqual(categoryData.value, { title, limit: cf(limit) }, { strict: true });
});

const { mutate: updateCategory, asyncStatus: updateCategoryAsyncStatus } = useUpdateCategory();
const { mutateAsync: deleteCategory, asyncStatus: deleteCategoryAsyncStatus } = useDeleteCategory();

const tryUpdateCategory = async () => {
	const valid = (await formRef.value?.validate())?.valid;
	if (valid && currentCategoryId.value) {
		updateCategory({ id: currentCategoryId.value, data: categoryData.value });
	}
};

const tryDeleteCategory = async () => {
	if (currentCategoryId.value) {
		await deleteCategory(currentCategoryId.value);
	}
	confirmationDialog.value = false;
};
</script>
