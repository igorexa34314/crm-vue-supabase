import { getUserId } from '@/api/auth';
import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import type { Tables, FunctionResponse } from '@/types/database.types';

export type Category = Pick<Tables<'categories'>, 'id' | 'title' | 'limit'>;
export type CategorySpendStats = Omit<
	FunctionResponse<'calculate_category_spend_for_auth_user'>[number],
	'created_at' | 'updated_at'
>;
export type CategoryData = Omit<Category, 'id'>;

export const categoryQuery = `id, title, limit` as const;
export const categorySpendStatsQuery = `${categoryQuery}, percent, spend` as const;

export const fetchCategories = async () => {
	const uid = await getUserId();
	const { error, data: categories } = await supabase
		.from('categories')
		.select<typeof categoryQuery, Category>(categoryQuery)
		.eq('user_id', uid)
		.order('created_at', { ascending: false });
	if (error) return errorHandler(error);
	return categories;
};

export const fetchCategoriesSpendStats = async () => {
	const { error, data: categories } = await supabase
		.rpc('calculate_category_spend_for_auth_user')
		.select<typeof categorySpendStatsQuery, CategorySpendStats>(categorySpendStatsQuery);
	if (error) return errorHandler(error);
	return categories;
};

export const createCategory = async (categoryData: CategoryData) => {
	const { error, data: newCategory } = await supabase
		.from('categories')
		.insert(categoryData)
		.select<typeof categoryQuery, Category>(categoryQuery)
		.single();
	if (error) return errorHandler(error);
	return newCategory;
};

export const updateCategory = async (categoryId: Category['id'], categoryData: CategoryData) => {
	const { error, data: category } = await supabase
		.from('categories')
		.update(categoryData)
		.eq('id', categoryId)
		.select<typeof categoryQuery, Category>(categoryQuery)
		.single();
	if (error) return errorHandler(error);
	return category;
};

export const deleteCategoryById = async (categoryId: Category['id']) => {
	const { error, data = {} } = await supabase.from('categories').delete().eq('id', categoryId);
	if (error) return errorHandler(error);
	return { success: true, ...data };
};

export const fetchCategoryById = async (id: Category['id']) => {
	const { error, data: category } = await supabase
		.from('categories')
		.select<typeof categoryQuery, Category>(categoryQuery)
		.eq('id', id)
		.single();
	if (error) return errorHandler(error);
	return category;
};
