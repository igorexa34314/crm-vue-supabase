import { getUserId } from '@/api/auth';
import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/config/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';
import type { Split } from 'type-fest';

export const categoryQuery = 'id, title, limit';
export const categorySpendStatsQuery = `${categoryQuery}, percent, spend`;

export type Category = Pick<Tables<'categories'>, Split<typeof categoryQuery, ', '>[number]>;
export type CategoryData = TablesInsert<'categories'>;

export const fetchCategories = async () => {
	const uid = await getUserId();
	const { error, data } = await supabase
		.from('categories')
		.select(categoryQuery)
		.eq('user_id', uid)
		.order('created_at', { ascending: false });
	if (error) throw errorHandler(error);
	return data;
};

export const fetchCategoriesSpendStats = async () => {
	const { error, data } = await supabase.rpc('calculate_category_spend_for_auth_user').select(categorySpendStatsQuery);
	if (error) throw errorHandler(error);
	return data;
};

export const createCategory = async (categoryData: TablesInsert<'categories'>) => {
	const { error, data } = await supabase.from('categories').insert(categoryData).select(categoryQuery).single();
	if (error) throw errorHandler(error);
	return data;
};

export const updateCategory = async (categoryId: Category['id'], categoryData: TablesUpdate<'categories'>) => {
	const { error, data } = await supabase
		.from('categories')
		.update(categoryData)
		.eq('id', categoryId)
		.select(categoryQuery)
		.single();
	if (error) throw errorHandler(error);
	return data;
};

export const deleteCategoryById = async (categoryId: Category['id']) => {
	const { error, data } = await supabase.from('categories').delete().eq('id', categoryId);
	if (error) throw errorHandler(error);
	return data;
};

export const fetchCategoryById = async (id: Category['id']) => {
	const { error, data } = await supabase.from('categories').select(categoryQuery).eq('id', id).single();
	if (error) throw errorHandler(error);
	return data;
};
