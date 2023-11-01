import { AuthService } from '@/services/auth';
import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { Tables } from '@/database.types';

export type Category = Pick<Tables<'categories'>, 'id' | 'title' | 'limit'>;
export type CategoryData = Omit<Category, 'id'>;

export class CategoryService {
	static categoryQuery = `id, title, limit` as const;

	static async fetchCategories() {
		const uid = await AuthService.getUserId();
		const { error, data: categories } = await supabase
			.from('categories')
			.select<typeof CategoryService.categoryQuery, Category>(CategoryService.categoryQuery)
			.eq('user_id', uid)
			.order('created_at', { ascending: false });
		if (error) return errorHandler(error);
		return categories;
	}

	static async fetchCategoriesSpendStats() {
		const { error, data: categories } = await supabase
			.rpc('calculate_category_spend_for_auth_user')
			.select(`${CategoryService.categoryQuery}, percent, spend`);
		if (error) return errorHandler(error);
		return categories;
	}

	static async createCategory(categoryData: CategoryData) {
		const { error, data: newCategory } = await supabase
			.from('categories')
			.insert(categoryData)
			.select<typeof CategoryService.categoryQuery, Category>(CategoryService.categoryQuery)
			.single();
		if (error) return errorHandler(error);
		return newCategory;
	}

	static async updateCategory(categoryId: Category['id'], categoryData: CategoryData) {
		const { error, data: category } = await supabase
			.from('categories')
			.update(categoryData)
			.eq('id', categoryId)
			.select<typeof CategoryService.categoryQuery, Category>(CategoryService.categoryQuery)
			.single();
		if (error) return errorHandler(error);
		return category;
	}

	static async deleteCategoryById(categoryId: Category['id']) {
		const { error, data = {} } = await supabase.from('categories').delete().eq('id', categoryId);
		if (error) return errorHandler(error);
		return { success: true, ...data };
	}

	static async fetchCategoryById(id: Category['id']) {
		const { error, data: category } = await supabase
			.from('categories')
			.select<typeof CategoryService.categoryQuery, Category>(CategoryService.categoryQuery)
			.eq('id', id)
			.single();
		if (error) return errorHandler(error);
		return category;
	}
}
