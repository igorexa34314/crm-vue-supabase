import { Constants } from '@/types/database-generated';

// App vars
export const recordTypes = Constants.public.Enums.record_type;
export const appTitle = import.meta.env.VITE_APP_TITLE || 'CRM VUE';
export const defaultBill = 1000;
export const defaultCategoryLimit = 100;
export const defaultRecordAmount = 20;
export const defaultRecordsPerPage = 10;
export const defaultSortType = 'desc';
