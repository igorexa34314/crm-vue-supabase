// App vars
export const recordTypes = ['income', 'outcome'] as const;
export const appTitle = import.meta.env.VITE_APP_TITLE || 'CRM VUE';
export const defaultBill = +import.meta.env.VITE_APP_DEFAULT_BILL || 1000;
export const defaultCategoryLimit = 100;
export const defaultRecordAmount = 20;
export const defaultRecordsPerPage = 5;
export const defaultSortType = 'desc';
