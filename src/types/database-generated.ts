export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: '12.2.12 (cd3cf9e)';
	};
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
						isOneToOne: false;
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
					translations: Json;
					updated_at: string | null;
				};
				Insert: {
					code: string;
					name: string;
					native_name: string;
					translations?: Json;
					updated_at?: string | null;
				};
				Update: {
					code?: string;
					name?: string;
					native_name?: string;
					translations?: Json;
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
						foreignKeyName: 'profiles_locale_fkey';
						columns: ['locale'];
						isOneToOne: false;
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
					id: string;
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
						isOneToOne: false;
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
						isOneToOne: false;
						referencedRelation: 'categories';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'records_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
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
				Args: never;
				Returns: {
					created_at: string;
					id: string;
					limit: number;
					percent: number;
					spend: number;
					title: string;
					updated_at: string;
				}[];
			};
			change_user_password: {
				Args: { current_password: string; new_password: string };
				Returns: Json;
			};
			get_record_types: {
				Args: never;
				Returns: Database['public']['Enums']['record_type'][][];
			};
			get_user_genders: {
				Args: never;
				Returns: Database['public']['Enums']['user_gender'][][];
			};
		};
		Enums: {
			record_type: 'income' | 'outcome';
			user_gender: 'male' | 'female' | 'unknown';
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
				DefaultSchema['Views'])
		? (DefaultSchema['Tables'] &
				DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema['Tables']
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
		? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema['Enums']
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
		? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema['CompositeTypes']
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
		? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {
			record_type: ['income', 'outcome'],
			user_gender: ['male', 'female', 'unknown'],
		},
	},
} as const;
