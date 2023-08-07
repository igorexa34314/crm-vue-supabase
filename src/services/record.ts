import { db, storage } from '@/firebase';
import { doc, collection as col, getDoc, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { AuthService } from '@/services/auth';
import { errorHandler } from '@/utils/errorHandler';
import { Timestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL, getBlob } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

type RecordType = 'income' | 'outcome';

export interface RecordDetail {
	fullname: string;
	bucket: string;
	fullpath: string;
	downloadURL: string;
	url?: string;
	size: number;
}

export interface Record {
	readonly id?: string;
	categoryId: string | undefined;
	description?: string;
	details?: RecordDetail[];
	amount: number;
	type: RecordType;
	date: Date;
}

export type RecordForm = Omit<Record, 'date'> & { details: File[] };

export class RecordService {
	static async createRecord({ details, ...record }: RecordForm) {
		try {
			const uid = await AuthService.getUserId();
			const isEmailVerified = await AuthService.isEmailVerified();
			if (!isEmailVerified) {
				throw new Error('verify_error');
			}
			const recordDoc = await addDoc(col(doc(col(db, 'users'), uid), 'records'), {
				...record,
				date: Timestamp.now()
			});
			if (details?.length) {
				await this.uploadRecordDetails(uid, recordDoc.id, details);
			}
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchRecords() {
		try {
			const records: Record[] = [];
			const uid = await AuthService.getUserId();
			const recordDocs = await getDocs(col(doc(col(db, 'users'), uid), 'records'));
			if (!recordDocs.empty) {
				recordDocs.forEach(doc => {
					const { date, details, ...record } = doc.data();
					records.push({
						...record,
						date: TimestampToDate(date),
						id: doc.id
					} as Record);
				});
				return records;
			}
		} catch (e) {
			errorHandler(e);
		}
	}

	static async fetchRecordById(id: string) {
		try {
			const uid = await AuthService.getUserId();
			const recordRef = doc(col(doc(col(db, 'users'), uid), 'records'), id);
			const recordDoc = await getDoc(recordRef);
			if (!recordDoc.exists()) {
				throw new Error('Record not found');
			}
			const { date, ...record } = recordDoc.data();
			return {
				...record,
				date: TimestampToDate(date),
				id
			} as Record;
		} catch (e) {
			errorHandler(e);
		}
	}

	private static async uploadRecordDetails(
		uid: string | undefined,
		recordId: string,
		files: File[]
	) {
		uid = uid ?? (await AuthService.getUserId());
		const uploadPromises: Promise<RecordDetail>[] = [];
		for (const file of files) {
			if (file instanceof File) {
				uploadPromises.push(
					(async () => {
						const fileRef = storageRef(
							storage,
							`userdata/${uid}/records/${recordId}/${uuidv4()}.${file.name
								.split('.')
								.at(-1)}`
						);
						await uploadBytes(fileRef, file, {
							contentType: file.type
						});
						const downloadURL = await getDownloadURL(fileRef);
						return {
							fullpath: fileRef.fullPath,
							bucket: fileRef.bucket,
							fullname: file.name,
							size: file.size,
							downloadURL
						};
					})()
				);
			}
			const details = await Promise.all(uploadPromises);
			await updateDoc(doc(col(doc(col(db, 'users'), uid), 'records'), recordId), { details });
		}
	}

	static async getAllRecordDetails(detailsData: RecordDetail[]) {
		const downloadPromises: Promise<string>[] = [];
		for (const detail of detailsData) {
			downloadPromises.push(this.downloadRecordDetail(detail));
		}
		return Promise.all(downloadPromises);
	}

	static async downloadRecordDetail(detail: RecordDetail) {
		const blobFile = await getBlob(storageRef(storage, detail.fullpath));
		return URL.createObjectURL(blobFile);
	}
}

export function TimestampToDate({ seconds, nanoseconds }: Timestamp) {
	return new Timestamp(seconds, nanoseconds).toDate();
}
