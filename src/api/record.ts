import { getUserId } from '@/api/auth';
import { supabase } from '@/config/supabase';
import { errorHandler } from '@/utils/errorHandler';
import { defaultRecordsPerPage } from '@/constants/app';
import { validateFileName } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import type { QueryData } from '@supabase/supabase-js';
import type { Enums, Tables, TablesInsert, TablesUpdate } from '@/types/database-generated';

const recordQuery = 'id, description, amount, type, created_at, updated_at';
const recordWithCategoryQuery = `${recordQuery}, category:categories (id, title, limit)`;
const recordWithDetailsQuery = `${recordWithCategoryQuery}, details:record_details(*)`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used for type inference
const recordQueryBuilder = supabase.from('records').select(recordQuery);
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used for type inference
const recordWithCategoryQueryBuilder = supabase
	.from('records')
	.select(recordWithCategoryQuery, { count: 'exact' });
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used for type inference
const recordWithDetailsQueryBuilder = supabase.from('records').select(recordWithDetailsQuery);

export type Record = QueryData<typeof recordQueryBuilder>[number];
export type RecordType = Enums<'record_type'>;
export type RecordDetail = Tables<'record_details'>;
export type RecordWithCategory = QueryData<typeof recordWithCategoryQueryBuilder>[number];
export type RecordWithDetails = QueryData<typeof recordWithDetailsQueryBuilder>[number];

export type RecordForm = TablesInsert<'records'> & { details: File[] };
export type RecordDataToUpdate = Omit<TablesUpdate<'records'>, 'category_id'>;

export const createRecord = async ({ details, ...record }: RecordForm) => {
	const { error, data } = await supabase
		.from('records')
		.insert(record)
		.select(recordWithCategoryQuery)
		.single();
	if (error) throw errorHandler(error);
	if (details?.length) {
		await uploadRecordDetails(data.id, details);
	}
	return data;
};

export const fetchRecordsWithCategory = async (options?: {
	sortBy?: keyof Record;
	order?: 'asc' | 'desc';
	page?: number;
	perPage?: number;
}) => {
	const uid = await getUserId();

	const { error, data, count } = await supabase
		.from('records')
		.select(recordWithCategoryQuery, { count: 'exact' })
		.eq('user_id', uid)
		.order(options?.sortBy || 'created_at', { ascending: options?.order === 'asc' })
		.range(
			((options?.page || 1) - 1) * (options?.perPage || defaultRecordsPerPage),
			(options?.page || 1) * (options?.perPage || defaultRecordsPerPage) - 1
		);
	if (error) throw errorHandler(error);
	return { records: data, count: count ?? data.length };
};

export const fetchRecordById = async (recordId: Record['id']) => {
	const { error, data } = await supabase
		.from('records')
		.select(recordWithDetailsQuery)
		.eq('id', recordId)
		.single();
	if (error) throw errorHandler(error);
	return data;
};

const uploadRecordDetails = async (recordId: Record['id'], files: File[]) => {
	return Promise.all(
		files
			.filter(file => file instanceof File && file.size <= 2 * 1024 * 1024)
			.map(async file => {
				const { error, data } = await supabase.storage
					.from('record_details')
					.upload(`${recordId}/${uuidv4()}__${validateFileName(file.name)}`, file);
				if (error) throw errorHandler(error);
				return data.path;
			})
	);
};

export const downloadRecordDetail = async (path: RecordDetail['fullpath']) => {
	const { error, data } = await supabase.storage.from('record_details').download(path);
	if (error) throw errorHandler(error);
	return data;
};

export const updateRecord = async (recordId: Record['id'], recordData: TablesUpdate<'records'>) => {
	const { error, data } = await supabase
		.from('records')
		.update(recordData)
		.eq('id', recordId)
		.select(recordWithCategoryQuery)
		.single();
	if (error) throw errorHandler(error);
	return data;
};

export const deleteRecordById = async (recordId: Record['id']) => {
	const { error, data } = await supabase.from('records').delete().eq('id', recordId);
	if (error) throw errorHandler(error);
	return data;
};
