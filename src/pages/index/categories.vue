<template>
	<div>
		<div class="title mb-7">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">
				{{ $t('pageTitles.categories') }}
			</h3>
		</div>

		<section class="mt-sm-10 mt-7">
			<app-loader v-if="categoriesState.status === 'pending' || isCurrencyPending" page />

			<template v-else-if="categoriesState.status === 'success'">
				<v-row :class="$vuetify.display.xs ? 'px-2' : 'px-4'">
					<v-col cols="6" md="6" sm="12" xs="12" class="create-category v-col-xs-12">
						<CreateCategory
							:default-limit="100"
							:class="{
								'pr-6': !$vuetify.display.smAndDown,
								'px-3': $vuetify.display.smAndDown && !$vuetify.display.xs,
							}" />
					</v-col>

					<v-col cols="6" md="6" sm="12" xs="12" class="edit-category v-col-xs-12">
						<EditCategory
							v-if="categoriesState.data.length"
							:categories="categoriesState.data"
							:default-limit="defaultCategoryLimit"
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
import { useSeoMeta } from '@unhead/vue';
import { defaultCategoryLimit } from '@/constants/app';
import { useCurrencyQueryState } from '@/queries/currency';
import { useCategoriesQuery } from '@/queries/categories';

useSeoMeta({ title: 'pageTitles.categories' });

const { isPending: isCurrencyPending } = useCurrencyQueryState();

const { state: categoriesState } = useCategoriesQuery();
</script>
