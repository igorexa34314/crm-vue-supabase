// App vars
export const recordTypes = ['income', 'outcome'] as const;
export const appTitle = import.meta.env.VITE_APP_TITLE || 'CRM VUE';
export const defaultBill = 1000;
export const defaultCategoryLimit = 100;
export const defaultRecordAmount = 20;
export const defaultRecordsPerPage = 10;
export const defaultSortType = 'desc';
