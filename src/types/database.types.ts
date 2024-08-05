import type { MessageSchema } from 'vue-i18n';
import type { Database as DatabaseGenerated } from './database-generated.types';
import type { MergeDeep } from 'type-fest';

export type { Json, Enums, Tables } from './database-generated.types';

// Override the type for a specific column in a table
export type Database = MergeDeep<
	DatabaseGenerated,
	{
		public: {
			Tables: {
				locales: {
					Row: {
						translations: MessageSchema;
					};
					Insert: {
						translations: MessageSchema;
					};
					Update: {
						translations: MessageSchema;
					};
				};
			};
		};
	}
>;

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? Omit<I, 'id' | 'created_at' | 'updated_at'>
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? Omit<I, 'id' | 'created_at' | 'updated_at'>
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? Omit<U, 'id' | 'created_at' | 'updated_at'>
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? Omit<U, 'id' | 'created_at' | 'updated_at'>
			: never
		: never;
