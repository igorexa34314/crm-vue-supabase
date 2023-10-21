import { Enums, Tables } from '@/database.types';
import { AuthService } from '@/services/auth';
import { Category, CategoryService } from '@/services/category';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { DEFAULT_RECORDS_PER_PAGE } from '@/global-vars';
import { validateFileName } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export type RecordType = Enums<'record_type'>;
export type Record = Omit<Tables<'records'>, 'user_id'>;
export type RecordDetail = Tables<'record_details'>;

export type RecordWithCategory = Omit<Record, 'category_id'> & { category: Category };
export type RecordWithDetails = RecordWithCategory & { details: RecordDetail[] };

export type RecordForm = Omit<Record, 'updated_at' | 'created_at' | 'id'> & { details: File[] };
export type RecordDataToUpdate = Pick<RecordForm, 'amount' | 'description' | 'type'>;

export type SortOrder = 'asc' | 'desc' | undefined;
export type SortFields = keyof Tables<'records'>;

export class RecordService {
	private static recordWithCategoryQuery =
		`id, description, amount, type, created_at, updated_at, category:categories (${CategoryService.categoryQuery})` as const;

	private static recordWithDetailQuery = `${this.recordWithCategoryQuery}, details:record_details(*)` as const;

	static async createRecord({ details, ...record }: RecordForm) {
		const { error, data: newRecord } = await supabase
			.from('records')
			.insert(record)
			.select<typeof this.recordWithCategoryQuery, RecordWithCategory>(this.recordWithCategoryQuery)
			.single();
		if (error) return errorHandler(error);
		if (details?.length) {
			await this.uploadRecordDetails(newRecord.id, details);
		}
		return newRecord;
	}

	static async fetchRecordsWithCategory(options?: {
		sortBy?: SortFields;
		order?: SortOrder;
		page?: number;
		perPage?: number;
	}) {
		const uid = await AuthService.getUserId();

		const {
			error,
			data: records,
			count,
		} = await supabase
			.from('records')
			.select<typeof this.recordWithCategoryQuery, RecordWithCategory>(this.recordWithCategoryQuery, {
				count: 'exact',
			})
			.eq('user_id', uid)
			.order(options?.sortBy || 'created_at', { ascending: options?.order === 'asc' })
			.range(
				((options?.page || 1) - 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE),
				(options?.page || 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE) - 1
			);
		if (error) return errorHandler(error);
		return { records, count: count || records.length };
	}

	static async fetchRecordById(recordId: Record['id']) {
		const { error, data: record } = await supabase
			.from('records')
			.select<typeof this.recordWithDetailQuery, RecordWithDetails>(this.recordWithDetailQuery)
			.eq('id', recordId)
			.single();
		if (error) return errorHandler(error);
		return record;
	}

	private static async uploadRecordDetails(recordId: Record['id'], files: File[]) {
		const uploadPromises = files
			.filter(file => file instanceof File && file.size <= 2 * 1024 * 1024)
			.map(async file => {
				const { error: uploadError, data: uploadData } = await supabase.storage
					.from('record_details')
					.upload(`${recordId}/${uuidv4()}__${validateFileName(file.name)}`, file);
				if (uploadError) return errorHandler(uploadError);
				return uploadData.path;
			});
		return Promise.all(uploadPromises);
	}

	static async downloadRecordDetail(path: RecordDetail['fullpath']) {
		const { error, data: blob } = await supabase.storage.from('record_details').download(path);
		if (error) return errorHandler(error);
		return blob;
	}

	static async updateRecord(recordId: Record['id'], recordData: RecordDataToUpdate) {
		const { error, data: updatedRecord } = await supabase
			.from('records')
			.update(recordData)
			.eq('id', recordId)
			.select<typeof this.recordWithCategoryQuery, RecordWithCategory>(this.recordWithCategoryQuery)
			.single();
		if (error) return errorHandler(error);
		return updatedRecord;
	}

	static async deleteRecordById(recordId: Record['id']) {
		const { error, data } = await supabase.from('records').delete().eq('id', recordId);
		if (error) return errorHandler(error);
		return data;
	}
}
