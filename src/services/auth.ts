import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { DEFAULT_BILL } from '@/globals';
import { SignInWithOAuthCredentials, User } from '@supabase/supabase-js';

export interface UserCredentials {
	email: string;
	password: string;
	username?: string;
}

const supportedOAuthProviders = ['google', 'facebook', 'github'] as const;
let user: User | undefined;

export class AuthService {
	static async login({ email, password }: UserCredentials) {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) throw error;
			return data.user;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async register({ email, password, username }: UserCredentials) {
		try {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						username,
						bill: DEFAULT_BILL
					}
				}
			});
			if (error) throw error;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async getUserId() {
		return user?.id ?? (await this.fetchUserId());
	}

	static async isUserVerified() {
		return !!user?.email_confirmed_at;
	}

	static setUser(newUser: User) {
		user = newUser;
	}

	static async fetchUserId() {
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();
		if (error || !user || !user.id) {
			throw new Error('User unauthenticated');
		}
		return user.id;
	}

	static async changeUserEmail(newEmail: string) {
		try {
			const { data, error } = await supabase.auth.updateUser(
				{ email: newEmail },
				{
					emailRedirectTo: `${import.meta.env.VITE_ENDPOINT_REDIRECT_URL}/profile?message=password_changed`
				}
			);
			if (error) throw error;
			return data.user;
		} catch (e) {
			errorHandler(e);
		}
	}

	static async changeUserPassword(oldPass: string, newPass: string) {
		try {
			const { error, data } = await supabase.rpc('change_user_password', {
				current_password: oldPass,
				new_password: newPass
			});
			if (error) throw new Error('invalid_password');
			return data;
		} catch (e) {
			errorHandler(e);
		}
	}

	// static async isEmailVerified() {
	// 	const user = await getCurrentUser();
	// 	if (!user || !user.uid) {
	// 		throw new Error('User unauthenticated');
	// 	}
	// 	return user.emailVerified;
	// }

	private static async signInWithOAuthProvider(
		provider: (typeof supportedOAuthProviders)[number],
		options: SignInWithOAuthCredentials['options'] = {}
	) {
		return supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${import.meta.env.VITE_ENDPOINT_REDIRECT_URL}/profile?message=login_success`,
				...options
			}
		});
	}

	static async signInWithGoogle() {
		try {
			const { data, error } = await this.signInWithOAuthProvider('google');
			if (error) throw error;
			return data.url;
		} catch (err) {
			errorHandler(err);
		}
	}

	static async signInWithFacebook() {
		try {
			const { data, error } = await this.signInWithOAuthProvider('facebook');
			if (error) throw error;
			return data.url;
		} catch (err) {
			errorHandler(err);
		}
	}

	static async signInWithGithub() {
		try {
			const { data, error } = await this.signInWithOAuthProvider('github');
			if (error) throw error;
			return data.url;
		} catch (err) {
			errorHandler(err);
		}
	}

	static async logout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (err) {
			errorHandler(err);
		}
	}
}
