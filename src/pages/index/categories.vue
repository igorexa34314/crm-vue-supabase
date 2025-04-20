<template>
	<div>
		<div class="title mb-7">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">
				{{ $t('pageTitles.categories') }}
			</h3>
		</div>

		<section class="mt-sm-10 mt-7">
			<app-loader v-if="isLoading || isCurrencyLoading" page />

			<template v-else>
				<v-row :class="$vuetify.display.xs ? 'px-2' : 'px-4'">
					<v-col cols="6" md="6" sm="12" xs="12" class="create-category v-col-xs-12">
						<CreateCategory
							:default-limit="100"
							@created="addNewCategory"
							:class="{
								'pr-6': !$vuetify.display.smAndDown,
								'px-3': $vuetify.display.smAndDown && !$vuetify.display.xs,
							}" />
					</v-col>

					<v-col cols="6" md="6" sm="12" xs="12" class="edit-category v-col-xs-12">
						<EditCategory
							v-if="categories.length"
							v-bind="{ categories, defaultCategoryLimit }"
							@updated="handleUpdatedCategory"
							@deleted="handleDeletedCategory"
							:class="{
								'pl-6': !$vuetify.display.smAndDown,
								'px-3': $vuetify.display.smAndDown && !$vuetify.display.xs,
							}"
							class="mt-5 mt-sm-7 mt-md-0" />
					</v-col>
				</v-row>
			</template>
		</section>
	</div>
</template>

<script setup lang="ts">
import CreateCategory from '@/components/categories/CreateCategory.vue';
import EditCategory from '@/components/categories/EditCategory.vue';
import { inject } from 'vue';
import { useSeoMeta } from '@unhead/vue';
import { useAsyncState } from '@vueuse/core';
import { fetchCategories, type Category } from '@/api/category';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { defaultCategoryLimit } from '@/constants/app';
import { currencyKey } from '@/injection-keys';

useSeoMeta({ title: 'pageTitles.categories' });

const { te, t } = useI18n({ useScope: 'global' });
const { isLoading: isCurrencyLoading } = inject(currencyKey)!;
const { state: categories, isLoading } = useAsyncState(fetchCategories, [], {
	onError: e => {
		const { showMessage } = useSnackbarStore();
		showMessage(
			te(`warnings.${e}`) ? t(`warnings.${e}`) : t('error_load_categories'),
			'red-darken-3'
		);
	},
});

const addNewCategory = (cat: Category) => {
	categories.value = [cat, ...categories.value];
};
const handleUpdatedCategory = ({ id, ...catData }: Category) => {
	categories.value = categories.value.map(cat => (cat.id === id ? { id, ...catData } : cat));
};
const handleDeletedCategory = (categoryId: Category['id']) => {
	categories.value = categories.value.filter(cat => cat.id !== categoryId);
};
</script>
