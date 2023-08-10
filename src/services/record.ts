import { Enums, Tables } from '@/database.types';
import { AuthService } from '@/services/auth';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export type RecordType = Enums<'record_type'>;

export type SortType = 'asc' | 'desc';
export type SortFields = keyof Tables<'records'>;
export type Record = Omit<Tables<'records'>, 'user_id'>;
export type RecordForm = Omit<Record, 'created_at' | 'id'> & { details: File[] };
export type RecordWithCategory = Awaited<ReturnType<typeof RecordService.fetchRecordsWithCategory>>;

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

	static async fetchRecordsWithCategory(sortBy: SortFields = 'created_at', sortType: SortType = 'desc') {
		try {
			const uid = await AuthService.getUserId();
			const { error, data: records } = await supabase
				.from('records')
				.select(`id, description, amount, type, created_at, category:categories (id, title, limit)`)
				.eq('user_id', uid)
				.order(sortBy, { ascending: sortType === 'asc' });
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
		const uid = await AuthService.getUserId();
		const uploadPromises: Promise<any>[] = [];
		for (const file of files) {
			if (file instanceof File && file.size <= 2 * 1024 * 1024) {
				uploadPromises.push(
					(async () => {
						const { error, data } = await supabase.storage
							.from('record_details')
							.upload(`${uid}/${recordId}/${uuidv4()}.${file.name.split('.').at(-1)}`, file);
						const {
							data: { publicUrl }
						} = supabase.storage
							.from('avatars')
							.getPublicUrl(data?.path || `${uid}/${uuidv4()}.${file.name.split('.').at(-1)}`);
						console.log(data?.path, publicUrl, error);
						// const { error } = await supabase.from('record_details').insert({
						// 	record_id: recordId,
						// 	public_url: publicUrl,
						// 	fullname: file.name,
						// 	size: file.size,
						// 	fullpath: avatarRef.data?.path || null
						// });
						// if (error) throw error;
						return { publicUrl };
					})()
				);
			}
			const details = await Promise.all(uploadPromises).catch(err => {
				throw err;
			});
		}
	}

	// static async getAllRecordDetails(detailsData: RecordDetail[]) {
	// 	const downloadPromises: Promise<string>[] = [];
	// 	for (const detail of detailsData) {
	// 		downloadPromises.push(this.downloadRecordDetail(detail));
	// 	}
	// 	return Promise.all(downloadPromises);
	// }

	// static async downloadRecordDetail(detail: RecordDetail) {
	// 	const blobFile = await getBlob(storageRef(storage, detail.fullpath));
	// 	return URL.createObjectURL(blobFile);
	// }
}
