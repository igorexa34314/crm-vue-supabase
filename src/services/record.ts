import { Enums, Tables } from '@/database.types';
import { AuthService } from '@/services/auth';
import { Category, CategoryService } from '@/services/category';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_RECORDS_PER_PAGE } from '@/global-vars';

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
	static async createRecord({ details, ...record }: RecordForm) {
		const { error, data: newRecord } = await supabase.from('records').insert(record).select('*').single();
		if (error) return errorHandler(error);
		if (details?.length && newRecord?.id) {
			await this.uploadRecordDetails(newRecord?.id, details);
		}
		return newRecord;
	}

	private static recordWithCategoryQuery =
		`id, description, amount, type, created_at, updated_at, category:categories (${CategoryService.categoryQuery})` as const;

	private static recordWithDetailQuery = `${this.recordWithCategoryQuery}, details:record_details(*)` as const;

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
			.order(options?.sortBy || 'created_at', { ascending: options?.order !== 'desc' || !!options?.order })
			.range(
				((options?.page || 1) - 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE),
				(options?.page || 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE) - 1
			);
		if (error) return errorHandler(error);
		return { records, count };
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
				const fileId = uuidv4();
				const { error: uploadError, data: uploadData } = await supabase.storage
					.from('record_details')
					.upload(`${recordId}/${fileId}.${file.name.split('.').at(-1)}`, file);
				if (uploadError) errorHandler(uploadError);
				if (!uploadData?.path) throw new Error('cant_get_uploaded_file');
				const { error: insertError, data: newDetail } = await supabase
					.from('record_details')
					.insert({
						record_id: recordId,
						fullname: file.name,
						size: file.size,
						fullpath: uploadData.path,
					})
					.select('*')
					.single();
				if (insertError) return errorHandler(insertError);
				return newDetail;
			});
		const details = await Promise.all(uploadPromises);
		return details;
	}

	static async getAllRecordDetails(detailsData: RecordDetail[]) {
		const downloadPromises = detailsData.map(async detail => await this.downloadRecordDetail(detail.fullpath));
		return (await Promise.all(downloadPromises)).filter(Boolean) as string[];
	}

	static async downloadRecordDetail(path: RecordDetail['fullpath']) {
		const { error, data: blobFile } = await supabase.storage.from('record_details').download(path);
		if (error) return errorHandler(error);
		return blobFile ? URL.createObjectURL(blobFile) : null;
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
