import { Enums, Tables } from '@/database.types';
import { AuthService } from '@/services/auth';
import { Category } from '@/services/category';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_RECORDS_PER_PAGE } from '@/globals';

export type RecordType = Enums<'record_type'>;
export type Record = Omit<Tables<'records'>, 'user_id'>;
export type RecordDetail = Tables<'record_details'>;

export type RecordWithCategory = Omit<Record, 'category_id'> & { category: Category };
export type RecordWithDetails = RecordWithCategory & { details: RecordDetail[] };

export type RecordForm = Omit<Record, 'updated_at' | 'created_at' | 'id'> & { details: File[] };

export type SortType = 'asc' | 'desc';
export type SortFields = keyof Tables<'records'>;

export class RecordService {
	static async createRecord({ details, ...record }: RecordForm) {
		try {
			const { error, data: newRecord } = await supabase.from('records').insert(record).select('*').single();
			if (error) throw error;
			if (details?.length && newRecord?.id) {
				await this.uploadRecordDetails(newRecord?.id, details);
			}
			return newRecord;
		} catch (e) {
			errorHandler(e);
		}
	}

	private static recordWithCategoryQuery = `id, description, amount, type, created_at, 
				category:categories (id, title, limit)` as const;

	private static recordWithDetailQuery = `${this.recordWithCategoryQuery}, details:record_details(*)` as const;

	static async fetchRecordsWithCategory(options?: {
		sortBy?: SortFields;
		sortType?: SortType;
		page?: number;
		perPage?: number;
	}) {
		const uid = await AuthService.getUserId();
		if (!uid) {
			throw new Error('user_unauthenticated');
		}
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
			.order(options?.sortBy || 'created_at', { ascending: options?.sortType === 'asc' })
			.range(
				((options?.page || 1) - 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE),
				(options?.page || 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE) - 1
			);
		if (error) return errorHandler(error);
		return { records, count };
	}

	static async loadMoreRecords(options?: {
		sortBy?: SortFields;
		sortType?: SortType;
		page?: number;
		perPage?: number;
	}) {
		const uid = await AuthService.getUserId();
		if (!uid) {
			throw new Error('user_unauthenticated');
		}
		const { error, data: records } = await supabase
			.from('records')
			.select<typeof this.recordWithCategoryQuery, RecordWithCategory>(this.recordWithCategoryQuery)
			.eq('user_id', uid)
			.order(options?.sortBy || 'created_at', { ascending: options?.sortType === 'asc' })
			.range(
				((options?.page || 1) - 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE),
				(options?.page || 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE) - 1
			);
		if (error) return errorHandler(error);
		return records;
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
		const uploadPromises: Promise<Pick<RecordDetail, 'id' | 'fullpath' | 'public_url'> | undefined>[] = [];
		for (const file of files) {
			if (file instanceof File && file.size <= 2 * 1024 * 1024) {
				uploadPromises.push(
					(async () => {
						const fileId = uuidv4();
						const { error: uploadError, data } = await supabase.storage
							.from('record_details')
							.upload(`${recordId}/${fileId}.${file.name.split('.').at(-1)}`, file);
						if (uploadError) errorHandler(uploadError);
						if (!data?.path) throw new Error('cant_get_uploaded_file');
						const {
							data: { publicUrl },
						} = supabase.storage.from('record_details').getPublicUrl(data?.path);
						const { error: insertError } = await supabase.from('record_details').insert({
							record_id: recordId,
							public_url: publicUrl,
							fullname: file.name,
							size: file.size,
							fullpath: data.path,
						});
						if (insertError) return errorHandler(insertError);
						return { id: fileId, fullpath: data.path, public_url: publicUrl };
					})()
				);
			}
		}
		const details = await Promise.all(uploadPromises);
		return details;
	}

	static async getAllRecordDetails(detailsData: RecordDetail[]) {
		const downloadPromises: Promise<string | undefined>[] = [];
		for (const detail of detailsData) {
			downloadPromises.push(this.downloadRecordDetail(detail.fullpath));
		}
		await Promise.all(downloadPromises);
	}

	static async downloadRecordDetail(path: RecordDetail['fullpath']) {
		const { error, data: blobFile } = await supabase.storage.from('record_details').download(path);
		if (error) return errorHandler(error);
		if (blobFile) {
			return URL.createObjectURL(blobFile);
		}
	}

	static async updateRecord(recordId: Record['id'], recordData: Pick<Record, 'amount' | 'description' | 'type'>) {
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
