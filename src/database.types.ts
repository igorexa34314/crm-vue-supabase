import { PostgrestError } from '@supabase/supabase-js';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					avatar_url: string | null;
					bill: number;
					bio: string | null;
					birthday_date: string | null;
					currency: Database['public']['Enums']['currencies'];
					first_name: string | null;
					gender: Database['public']['Enums']['genders'];
					id: string;
					last_name: string | null;
					locale: Database['public']['Enums']['locales'] | null;
					updated_at: string | null;
					username: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					bill?: number;
					bio?: string | null;
					birthday_date?: string | null;
					currency?: Database['public']['Enums']['currencies'];
					first_name?: string | null;
					gender?: Database['public']['Enums']['genders'];
					id: string;
					last_name?: string | null;
					locale?: Database['public']['Enums']['locales'] | null;
					updated_at?: string | null;
					username?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					bill?: number;
					bio?: string | null;
					birthday_date?: string | null;
					currency?: Database['public']['Enums']['currencies'];
					first_name?: string | null;
					gender?: Database['public']['Enums']['genders'];
					id?: string;
					last_name?: string | null;
					locale?: Database['public']['Enums']['locales'] | null;
					updated_at?: string | null;
					username?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey';
						columns: ['id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			currencies: 'USD' | 'EUR' | 'UAH' | 'RUB';
			genders: 'male' | 'female' | 'unknown';
			locales: 'en-US' | 'ru-RU' | 'uk-UA';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;
