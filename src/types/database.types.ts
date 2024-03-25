import type { PostgrestError } from '@supabase/supabase-js';
import type { MessageSchema } from 'vue-i18n';

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
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
				];
			};
			locales: {
				Row: {
					code: string;
					name: string;
					native_name: string;
					translations: MessageSchema;
					updated_at: string | null;
				};
				Insert: {
					code: string;
					name: string;
					native_name: string;
					translations?: MessageSchema;
					updated_at?: string | null;
				};
				Update: {
					code?: string;
					name?: string;
					native_name?: string;
					translations?: MessageSchema;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					avatar_url: string;
					bill: number;
					bio: string;
					birthday_date: string | null;
					currency: string;
					first_name: string;
					gender: Database['public']['Enums']['user_gender'];
					id: string;
					last_name: string;
					locale: string;
					updated_at: string | null;
					username: string;
				};
				Insert: {
					avatar_url?: string;
					bill?: number;
					bio?: string;
					birthday_date?: string | null;
					currency?: string;
					first_name?: string;
					gender?: Database['public']['Enums']['user_gender'];
					id: string;
					last_name?: string;
					locale?: string;
					updated_at?: string | null;
					username: string;
				};
				Update: {
					avatar_url?: string;
					bill?: number;
					bio?: string;
					birthday_date?: string | null;
					currency?: string;
					first_name?: string;
					gender?: Database['public']['Enums']['user_gender'];
					id?: string;
					last_name?: string;
					locale?: string;
					updated_at?: string | null;
					username?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey';
						columns: ['id'];
						referencedRelation: 'users';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'profiles_locale_fkey';
						columns: ['locale'];
						referencedRelation: 'locales';
						referencedColumns: ['code'];
					},
				];
			};
			record_details: {
				Row: {
					created_at: string;
					fullname: string;
					fullpath: string;
					id: string;
					record_id: string;
					size: number;
				};
				Insert: {
					created_at?: string;
					fullname?: string;
					fullpath: string;
					id?: string;
					record_id: string;
					size: number;
				};
				Update: {
					created_at?: string;
					fullname?: string;
					fullpath?: string;
					id?: string;
					record_id?: string;
					size?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'record_details_record_id_fkey';
						columns: ['record_id'];
						referencedRelation: 'records';
						referencedColumns: ['id'];
					},
				];
			};
			records: {
				Row: {
					amount: number;
					category_id: string;
					created_at: string;
					description: string;
					id: string;
					type: Database['public']['Enums']['record_type'];
					updated_at: string | null;
					user_id: string;
				};
				Insert: {
					amount: number;
					category_id: string;
					created_at?: string;
					description?: string;
					id?: string;
					type: Database['public']['Enums']['record_type'];
					updated_at?: string | null;
					user_id?: string;
				};
				Update: {
					amount?: number;
					category_id?: string;
					created_at?: string;
					description?: string;
					id?: string;
					type?: Database['public']['Enums']['record_type'];
					updated_at?: string | null;
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
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			calculate_category_spend_for_auth_user: {
				Args: Record<PropertyKey, never>;
				Returns: {
					id: string;
					title: string;
					limit: number;
					spend: number;
					percent: number;
					created_at: string;
					updated_at: string;
				}[];
			};
			change_user_password: {
				Args: {
					current_password: string;
					new_password: string;
				};
				Returns: Json;
			};
			get_record_types: {
				Args: Record<PropertyKey, never>;
				Returns: string[];
			};
			get_user_genders: {
				Args: Record<PropertyKey, never>;
				Returns: string[];
			};
		};
		Enums: {
			user_gender: 'male' | 'female' | 'unknown';
			record_type: 'income' | 'outcome';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
export type FunctionResponse<T extends keyof Database['public']['Functions']> =
	Database['public']['Functions'][T]['Returns'];

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
export type DbResultErr = PostgrestError;
