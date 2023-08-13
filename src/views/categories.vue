<template>
	<div>
		<div class="title mb-7">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.categories') }}</h3>
		</div>
		<section class="mt-sm-10 mt-7">
			<app-loader v-if="isLoading" page />
			<v-row v-else :class="xs ? 'px-2' : 'px-4'">
				<v-col cols="6" md="6" sm="12" xs="12" class="create-category v-col-xs-12">
					<CreateCategory :default-limit="100" @created="addNewCategory"
						:class="{ 'pr-6': !smAndDown, 'px-3': smAndDown && !xs }" />
				</v-col>
				<v-col cols="6" md="6" sm="12" xs="12" class="edit-category v-col-xs-12">
					<EditCategory v-if="categories?.length" v-bind="{ categories, defaultLimit }" @updated="updateCategories"
						:class="{ 'pl-6': !smAndDown, 'px-3': smAndDown && !xs }" class="mt-5 mt-sm-7 mt-md-0" />
				</v-col>
			</v-row>
		</section>
	</div>
</template>

<script setup lang="ts">
import CreateCategory from '@/components/categories/CreateCategory.vue';
import EditCategory from '@/components/categories/EditCategory.vue';
import { useMeta } from 'vue-meta';
import { useAsyncState } from '@vueuse/core';
import { CategoryService, Category } from '@/services/category';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import { useSnackbarStore } from '@/stores/snackbar';
import { DEFAULT_CATEGORY_LIMIT as defaultLimit } from '@/globals';

// Page title: Categories
useMeta({ title: 'pageTitles.categories' });

const { te, t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { smAndDown, xs } = useDisplay();
const { state: categories, isLoading } = useAsyncState(CategoryService.fetchCategories, [], {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage(te(`warning.messages.${e}`) ? t(`warning.messages.${e}`) : t('error_load_categories'), 'red-darken-3')
	}
});

const addNewCategory = (cat: Category) => {
	if (categories.value) {
		categories.value = [...categories.value, cat];
	}
	else {
		categories.value = [cat];
	}
};
const updateCategories = ({ id, ...catData }: Category) => {
	categories.value = categories.value?.map(cat => cat.id === id ? { id, ...catData } : cat);
};
</script>