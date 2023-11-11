import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { supportedOAuthProviders, DEFAULT_BILL } from '@/global-vars';
import type { SignInWithOAuthCredentials, Subscription, User, UserAttributes } from '@supabase/supabase-js';

export interface UserCredentials extends Required<Pick<UserAttributes, 'email' | 'password'>> {
	username?: string;
}

let user: User | null = null;
let subscription: Subscription;

export class AuthService {
	static getCurrentUser() {
		return new Promise((resolve: (currentUser: typeof user) => void) => {
			if (user) {
				resolve(user);
			} else {
				subscription?.unsubscribe();
				const { data } = supabase.auth.onAuthStateChange((event, session) => {
					user = session?.user ?? null;
					resolve(user);
				});
				subscription = data.subscription;
			}
		});
	}

	static async getUserId() {
		const user = await AuthService.getCurrentUser();
		if (!user) {
			throw new Error('User unauthenticated');
		}
		return user.id;
	}

	static async login({ email, password }: UserCredentials) {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) return errorHandler(error);
		return data.user;
	}

	static async register({ email, password, username }: UserCredentials) {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username,
					bill: DEFAULT_BILL,
				},
			},
		});
		if (error) return errorHandler(error);
		return data.user;
	}

	static async changeUserEmail(newEmail: string) {
		const { data, error } = await supabase.auth.updateUser(
			{ email: newEmail },
			{
				emailRedirectTo: `${import.meta.env.VITE_ENDPOINT_REDIRECT_URL}${
					import.meta.env.BASE_URL
				}profile?message=password_changed`,
			}
		);
		if (error) return errorHandler(error);
		return data.user;
	}

	static async changeUserPassword(oldPass: string, newPass: string) {
		const { error, data } = await supabase.rpc('change_user_password', {
			current_password: oldPass,
			new_password: newPass,
		});
		if (error) return errorHandler(error);
		return data;
	}

	private static async signInWithOAuthProvider(
		provider: (typeof supportedOAuthProviders)[number],
		options: SignInWithOAuthCredentials['options'] = {}
	) {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${import.meta.env.VITE_ENDPOINT_REDIRECT_URL}${
					import.meta.env.BASE_URL
				}profile?message=login_success`,
				...options,
			},
		});
		if (error) return errorHandler(error);
		return data.url;
	}

	static async signInWithGoogle() {
		return this.signInWithOAuthProvider('google');
	}

	static async signInWithFacebook() {
		return this.signInWithOAuthProvider('facebook');
	}

	static async signInWithGithub() {
		return this.signInWithOAuthProvider('github');
	}

	static async logout() {
		const { error } = await supabase.auth.signOut();
		if (error) return errorHandler(error);
	}
}
