import { AuthService } from '@/services/auth';
import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { Tables } from '@/database.types';

export type Category = Omit<Tables<'categories'>, 'updated_at' | 'created_at' | 'user_id'>;

export class CategoryService {
	static async fetchCategories() {
		try {
			const uid = await AuthService.getUserId();
			const categories = await supabase
				.from('categories')
				.select('id, limit, title')
				.eq('user_id', uid)
				.order('created_at', { ascending: false });
			return categories;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async createCategory(categoryData: Omit<Category, 'id'>) {
		try {
			// const isEmailVerified = await AuthService.isEmailVerified();
			// if (!isEmailVerified) {
			// 	throw new Error('verify_error');
			// }
			const { error, data: newCategory } = await supabase
				.from('categories')
				.insert(categoryData)
				.select('id, limit, title')
				.single();
			if (error) throw error;
			return newCategory;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async updateCategory(categoryId: string, categoryData: Partial<Category>) {
		try {
			const uid = await AuthService.getUserId();
			// const isEmailVerified = await AuthService.isEmailVerified();
			// if (!isEmailVerified) {
			// 	throw new Error('verify_error');
			// }
			const { error, data: category } = await supabase
				.from('categories')
				.update(categoryData)
				.eq('id', categoryId)
				.select('id, limit, title');
			if (error) throw error;
			return category;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchCategoryById(id: Category['id']) {
		try {
			const { error, data: category } = await supabase
				.from('categories')
				.select('id, limit, title')
				.eq('id', id)
				.single();
			if (error) {
				throw error;
			}
			return category;
		} catch (e) {
			errorHandler(e);
		}
	}
}
