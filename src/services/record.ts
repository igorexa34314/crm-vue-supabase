import { Enums, Tables } from '@/database.types';
import { AuthService } from '@/services/auth';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { v4 as uuidv4 } from 'uuid';

type RecordType = Enums<'record_type'>;

export interface RecordDetail {
	fullname: string;
	bucket: string;
	fullpath: string;
	downloadURL: string;
	url?: string;
	size: number;
}

export type Record = Omit<Tables<'records'>, 'user_id'>;
export type RecordForm = Record & { details: File[] };

export class RecordService {
	static async createRecord({ details, ...record }: RecordForm) {
		try {
			// const isEmailVerified = await AuthService.isEmailVerified();
			// if (!isEmailVerified) {
			// 	throw new Error('verify_error');
			// }
			const { error, data: newRecord } = await supabase.from('records').insert(record).select().single();
			if (error) throw error;
			// if (details?.length && newRecord?.id) {
			// 	await this.uploadRecordDetails(uid, newRecord?.id, details);
			// }
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
				.select()
				.eq('user_id', uid)
				.order('category_id', { ascending: false });
			if (error) throw error;
			return records;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchRecordById(id: string) {
		try {
			const { error, data: record } = await supabase.from('records').select().eq('id', id).single();
			if (error) throw error;
			return record;
		} catch (e) {
			errorHandler(e);
		}
	}

	private static async uploadRecordDetails(uid: string | undefined, recordId: string, files: File[]) {
		uid = uid ?? (await AuthService.getUserId());
		const uploadPromises: Promise<any>[] = [];
		for (const file of files) {
			if (file instanceof File && file.size <= 2 * 1024 * 1024) {
				uploadPromises.push(
					(async () => {
						const avatarRef = await supabase.storage
							.from('record_details')
							.upload(`${uid}/${recordId}/${uuidv4()}.${file.name.split('.').at(-1)}`, file);
						console.log(avatarRef.data?.path);
						const {
							data: { publicUrl }
						} = supabase.storage
							.from('avatars')
							.getPublicUrl(avatarRef.data?.path || `${uid}/${uuidv4()}.${file.name.split('.').at(-1)}`);
						const { error, data: detail } = await supabase
							.from('record_details')
							.insert({ avatar_url: publicUrl })
							.select();
						if (error) throw error;
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
