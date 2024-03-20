import { getUserId } from '@/api/auth';
import { categoryQuery, type Category } from '@/api/category';
import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { DEFAULT_RECORDS_PER_PAGE } from '@/global-vars';
import { validateFileName } from '@/utils/validations';
import { v4 as uuidv4 } from 'uuid';
import type { Enums, Tables } from '@/types/database.types';

export type RecordType = Enums<'record_type'>;
export type Record = Omit<Tables<'records'>, 'user_id'>;
export type RecordDetail = Tables<'record_details'>;

export type RecordWithCategory = Omit<Record, 'category_id'> & { category: Category };
export type RecordWithDetails = RecordWithCategory & { details: RecordDetail[] };

export type RecordForm = Omit<Record, 'updated_at' | 'created_at' | 'id'> & { details: File[] };
export type RecordDataToUpdate = Pick<RecordForm, 'amount' | 'description' | 'type'>;

export type SortOrder = 'asc' | 'desc' | undefined;
export type SortFields = keyof Record;

const recordWithCategoryQuery =
	`id, description, amount, type, created_at, updated_at, category:categories (${categoryQuery})` as const;

const recordWithDetailQuery = `${recordWithCategoryQuery}, details:record_details(*)` as const;

export const createRecord = async ({ details, ...record }: RecordForm) => {
	const { error, data: newRecord } = await supabase
		.from('records')
		.insert(record)
		.select<typeof recordWithCategoryQuery, RecordWithCategory>(recordWithCategoryQuery)
		.single();
	if (error) return errorHandler(error);
	if (details?.length) {
		await uploadRecordDetails(newRecord.id, details);
	}
	return newRecord;
};

export const fetchRecordsWithCategory = async (options?: {
	sortBy?: SortFields;
	order?: SortOrder;
	page?: number;
	perPage?: number;
}) => {
	const uid = await getUserId();

	const {
		error,
		data: records,
		count,
	} = await supabase
		.from('records')
		.select<typeof recordWithCategoryQuery, RecordWithCategory>(recordWithCategoryQuery, {
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
};

export const fetchRecordById = async (recordId: Record['id']) => {
	const { error, data: record } = await supabase
		.from('records')
		.select<typeof recordWithDetailQuery, RecordWithDetails>(recordWithDetailQuery)
		.eq('id', recordId)
		.single();
	if (error) return errorHandler(error);
	return record;
};

const uploadRecordDetails = async (recordId: Record['id'], files: File[]) => {
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
};

export const downloadRecordDetail = async (path: RecordDetail['fullpath']) => {
	const { error, data: blob } = await supabase.storage.from('record_details').download(path);
	if (error) return errorHandler(error);
	return blob;
};

export const updateRecord = async (recordId: Record['id'], recordData: RecordDataToUpdate) => {
	const { error, data: updatedRecord } = await supabase
		.from('records')
		.update(recordData)
		.eq('id', recordId)
		.select<typeof recordWithCategoryQuery, RecordWithCategory>(recordWithCategoryQuery)
		.single();
	if (error) return errorHandler(error);
	return updatedRecord;
};

export const deleteRecordById = async (recordId: Record['id']) => {
	const { error, data } = await supabase.from('records').delete().eq('id', recordId);
	if (error) return errorHandler(error);
	return data;
};
