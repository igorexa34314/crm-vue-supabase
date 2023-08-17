<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h6 mb-5 mb-sm-7 text-subtitle">{{ t('edit') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="submitHandler">
			<v-select
				v-model="currentCategory.id"
				:items="categories"
				item-title="title"
				item-value="id"
				:label="t('select_category')"
				variant="underlined"
				class="text-input" />

			<LocalizedInput
				v-model="currentCategory.title"
				:rules="validations.title"
				variant="underlined"
				:label="t('title')"
				class="mt-6"
				required />

			<LocalizedInput
				v-model="currentCategory.limit"
				:rules="validations.limit"
				variant="underlined"
				type="number"
				:label="t('limit') + ` (${userCurrency})`"
				class="mt-6"
				required />

			<v-btn
				color="success"
				type="submit"
				:class="xs ? 'mt-4' : 'mt-7'"
				:disabled="isNewCategoryEquals"
				:loading="loading">
				{{ t('update') }}
				<v-icon :icon="mdiSend" class="ml-3" />
			</v-btn>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import LocalizedInput from '@/components/UI/LocalizedInput.vue';
import { ref, watchEffect } from 'vue';
import { mdiSend } from '@mdi/js';
import { CategoryService, Category } from '@/services/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { category as validations } from '@/utils/validations';
import { VForm } from 'vuetify/components';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { storeToRefs } from 'pinia';
import { useDisplay } from 'vuetify';
import { isEqual } from 'lodash';
import { DEFAULT_CATEGORY_LIMIT } from '@/globals';
import { computed } from 'vue';

const props = withDefaults(
	defineProps<{
		categories: Category[];
		defaultLimit?: number;
	}>(),
	{
		defaultLimit: DEFAULT_CATEGORY_LIMIT,
	}
);

const emit = defineEmits<{
	updated: [cat: Category];
}>();

const { t, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { showMessage } = useSnackbarStore();
const { cf } = useCurrencyFilter();
const { xs } = useDisplay();
const { userCurrency } = storeToRefs(useUserStore());

const form = ref<VForm>();
const loading = ref(false);
const currentCategory = ref<Category>({
	id: props.categories[0].id,
	title: '',
	limit: Math.round(cf.value(props.defaultLimit) / 100) * 100,
});

watchEffect(() => {
	const category = props.categories.find(({ id }) => id === currentCategory.value.id);
	if (category) {
		currentCategory.value.title = category.title;
		currentCategory.value.limit = Math.round(cf.value(category.limit) / 100) * 100;
	}
});

const isNewCategoryEquals = computed(() => {
	const { id, ...newCategory } = currentCategory.value;
	const { title, limit } = props.categories.find(cat => cat.id === id)!;
	return isEqual(newCategory, { title, limit: Math.round(cf.value(limit) / 100) * 100 });
});

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	const { id, limit, ...categoryData } = currentCategory.value;
	if (valid && id) {
		try {
			const convertedLimit = cf.value(limit, undefined, 'reverse');
			loading.value = true;
			const updatedCat = await CategoryService.updateCategory(id, { ...categoryData, limit: convertedLimit });
			if (updatedCat) {
				showMessage(t('category_updated'));
				emit('updated', updatedCat);
			}
		} catch (e) {
			if (typeof e === 'string') {
				showMessage(te(e) ? t(e) : e, 'red-darken-3');
			} else {
				showMessage('error_update_category', 'red-darken-3');
			}
		} finally {
			loading.value = false;
		}
	}
};
</script>
