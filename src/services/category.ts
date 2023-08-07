import { db } from '@/firebase';
import { doc, collection as col, getDoc, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { AuthService } from '@/services/auth';
import { errorHandler } from '@/utils/errorHandler';

export interface Category {
	readonly id?: string;
	title: string;
	limit: number;
}

export class CategoryService {
	static async fetchCategories() {
		try {
			const categories: Category[] = [];
			const uid = await AuthService.getUserId();
			const categoriesSnapshot = await getDocs(col(doc(col(db, 'users'), uid), 'categories'));
			categoriesSnapshot.forEach(doc => {
				categories.push({ id: doc.id, ...(doc.data() as Category) });
			});
			return categories;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async createCategory(categoryData: Category) {
		try {
			const uid = await AuthService.getUserId();
			const isEmailVerified = await AuthService.isEmailVerified();
			if (!isEmailVerified) {
				throw new Error('verify_error');
			}
			const newCategoryRef = await addDoc(
				col(doc(col(db, 'users'), uid), 'categories'),
				categoryData
			);
			return { ...categoryData, id: newCategoryRef.id as string };
		} catch (e) {
			errorHandler(e);
		}
	}

	static async updateCategory(categoryId: string, categoryData: Partial<Category>) {
		try {
			const uid = await AuthService.getUserId();
			const isEmailVerified = await AuthService.isEmailVerified();
			if (!isEmailVerified) {
				throw new Error('verify_error');
			}
			const categoryRef = doc(col(doc(col(db, 'users'), uid), 'categories'), categoryId);
			await updateDoc(categoryRef, categoryData);
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchCategoryById(id: Category['id']) {
		try {
			const uid = await AuthService.getUserId();
			const categoryRef = await doc(col(doc(col(db, 'users'), uid), 'categories'), id);
			const categoryDoc = await getDoc(categoryRef);
			if (!categoryDoc.exists()) {
				throw new Error('Category with this id does not exist');
			}
			return { ...categoryDoc.data(), id } as Category;
		} catch (e) {
			errorHandler(e);
		}
	}
}
