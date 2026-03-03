import type { Database as DatabaseGenerated } from './database-generated';
import type { MergeDeep } from 'type-fest';

type TranslationsJson = typeof import('@/locales/en-US.json');

export type Database = MergeDeep<
	DatabaseGenerated,
	{
		public: {
			Tables: {
				locales: {
					Row: {
						translations: TranslationsJson;
					};
					// Optional: Use if you want type-checking for inserts and updates
					// Insert: {
					// 	translations?: TranslationsJson;
					// };
					// Update: {
					// 	translations?: TranslationsJson;
					// };
				};
			};
		};
	}
>;

export { Constants } from './database-generated';

export type {
	CompositeTypes,
	Enums,
	Tables,
	Json,
	TablesInsert,
	TablesUpdate,
} from './database-generated';
