import { Enums, Tables } from '@/database.types';
import { AuthService } from '@/services/auth';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_RECORDS_PER_PAGE } from '@/globals';

export type RecordType = Enums<'record_type'>;
export type Record = Omit<Tables<'records'>, 'user_id'>;
export type RecordWithCategory = Exclude<
	Awaited<ReturnType<typeof RecordService.fetchRecordsWithCategory>>,
	undefined
>['records'];

export type RecordForm = Omit<Record, 'created_at' | 'id'> & { details: File[] };

export type SortType = 'asc' | 'desc';
export type SortFields = keyof Tables<'records'>;

export type RecordDetail = Tables<'record_details'>;

export class RecordService {
	static async createRecord({ details, ...record }: RecordForm) {
		try {
			// const isEmailVerified = await AuthService.isEmailVerified();
			// if (!isEmailVerified) {
			// 	throw new Error('verify_error');
			// }
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

	static async fetchRecords() {
		try {
			const uid = await AuthService.getUserId();
			const { error, data: records } = await supabase
				.from('records')
				.select('*')
				.eq('user_id', uid)
				.order('category_id', { ascending: false });
			if (error) throw error;
			return records;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchRecordsWithCategory(options?: {
		sortBy?: SortFields;
		sortType?: SortType;
		page?: number;
		perPage?: number;
	}) {
		try {
			const uid = await AuthService.getUserId();
			const {
				error,
				data: records,
				count,
			} = await supabase
				.from('records')
				.select(`id, description, amount, type, created_at, category:categories (id, title, limit)`, {
					count: 'exact',
				})
				.eq('user_id', uid)
				.order(options?.sortBy || 'created_at', { ascending: options?.sortType === 'asc' })
				.range(
					((options?.page || 1) - 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE),
					(options?.page || 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE) - 1
				);
			if (error) {
				throw error;
			}
			return { records, count };
		} catch (e) {
			errorHandler(e);
		}
	}

	static async loadMoreRecords(options?: {
		sortBy?: SortFields;
		sortType?: SortType;
		page?: number;
		perPage?: number;
	}) {
		try {
			const uid = await AuthService.getUserId();
			const { error, data: records } = await supabase
				.from('records')
				.select(`id, description, amount, type, created_at, category:categories (id, title, limit)`)
				.eq('user_id', uid)
				.order(options?.sortBy || 'created_at', { ascending: options?.sortType === 'asc' })
				.range(
					((options?.page || 1) - 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE),
					(options?.page || 1) * (options?.perPage || DEFAULT_RECORDS_PER_PAGE) - 1
				);
			if (error) throw error;
			return records;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchRecordById(recordId: string) {
		try {
			const { error, data: record } = await supabase
				.from('records')
				.select(
					'id, description, amount, type, created_at, category:categories (id, title, limit), details:record_details(*)'
				)
				.eq('id', recordId)
				.single();
			if (error) throw error;
			return record;
		} catch (e) {
			errorHandler(e);
		}
	}

	private static async uploadRecordDetails(recordId: string, files: File[]) {
		const uploadPromises: Promise<{ id: string; fullpath: string; publicUrl: string } | undefined>[] = [];
		for (const file of files) {
			if (file instanceof File && file.size <= 2 * 1024 * 1024) {
				uploadPromises.push(
					(async () => {
						const fileId = uuidv4();
						const { error, data } = await supabase.storage
							.from('record_details')
							.upload(`${recordId}/${fileId}.${file.name.split('.').at(-1)}`, file);
						if (error) throw error;
						if (data?.path) {
							const {
								data: { publicUrl },
							} = supabase.storage.from('record_details').getPublicUrl(data?.path);
							const { error } = await supabase.from('record_details').insert({
								record_id: recordId,
								public_url: publicUrl,
								fullname: file.name,
								size: file.size,
								fullpath: data.path,
							});
							if (error) throw error;
							return { id: fileId, fullpath: data.path, publicUrl };
						}
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
			downloadPromises.push(this.downloadRecordDetail(detail));
		}
		await Promise.all(downloadPromises);
	}

	static async downloadRecordDetail(detail: RecordDetail) {
		const { error, data: blobFile } = await supabase.storage.from('record_details').download(detail.fullpath);
		if (error) throw error;
		if (blobFile) {
			return URL.createObjectURL(blobFile);
		}
	}
}
