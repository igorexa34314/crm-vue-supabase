import { PostgrestError } from '@supabase/supabase-js';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			categories: {
				Row: {
					created_at: string;
					id: string;
					limit: number;
					title: string;
					updated_at: string | null;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					limit: number;
					title: string;
					updated_at?: string | null;
					user_id?: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					limit?: number;
					title?: string;
					updated_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'categories_user_id_fkey';
						columns: ['user_id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					}
				];
			};
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
			records: {
				Row: {
					category_id: string;
					created_at: string;
					description: string;
					id: string;
					type: Database['public']['Enums']['record_type'];
					user_id: string;
				};
				Insert: {
					category_id: string;
					created_at?: string;
					description: string;
					id?: string;
					type: Database['public']['Enums']['record_type'];
					user_id?: string;
				};
				Update: {
					category_id?: string;
					created_at?: string;
					description?: string;
					id?: string;
					type?: Database['public']['Enums']['record_type'];
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'records_category_id_fkey';
						columns: ['category_id'];
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'records_user_id_fkey';
						columns: ['user_id'];
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
			record_type: 'income' | 'outcome';
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
