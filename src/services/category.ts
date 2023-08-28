import { AuthService } from '@/services/auth';
import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { Tables } from '@/database.types';

export type Category = Omit<Tables<'categories'>, 'updated_at' | 'created_at' | 'user_id'>;

export class CategoryService {
	static async fetchCategories() {
		const uid = await AuthService.getUserId();
		if (!uid) {
			throw new Error('user_unauthenticated');
		}
		const { error, data: categories } = await supabase
			.from('categories')
			.select(`id, limit, title`)
			.eq('user_id', uid)
			.order('created_at', { ascending: false });
		if (error) return errorHandler(error);
		return categories;
	}

	static async fetchCategoriesSpendStats() {
		const { error, data: categories } = await supabase.rpc('calculate_category_spend_for_auth_user');
		if (error) return errorHandler(error);
		return categories;
	}

	static async createCategory(categoryData: Omit<Category, 'id'>) {
		const { error, data: newCategory } = await supabase
			.from('categories')
			.insert(categoryData)
			.select(`id, limit, title`)
			.single();
		if (error) return errorHandler(error);
		return newCategory;
	}

	static async updateCategory(categoryId: string, categoryData: Partial<Category>) {
		const { error, data: category } = await supabase
			.from('categories')
			.update(categoryData)
			.eq('id', categoryId)
			.select(`id, limit, title`)
			.single();
		if (error) return errorHandler(error);
		return category;
	}

	static async fetchCategoryById(id: Category['id']) {
		const { error, data: category } = await supabase
			.from('categories')
			.select(`id, limit, title`)
			.eq('id', id)
			.single();
		if (error) return errorHandler(error);
		return category;
	}
}
