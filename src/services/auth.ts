import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { DEFAULT_BILL } from '@/global-vars';
import { SignInWithOAuthCredentials, Subscription, User } from '@supabase/supabase-js';

export interface UserCredentials {
	email: string;
	password: string;
	username?: string;
}

const supportedOAuthProviders = ['google', 'facebook', 'github'] as const;
let user: User | undefined;
let subscription: Subscription | undefined;

export class AuthService {
	static getCurrentUser() {
		return new Promise((resolve: (currentUser: typeof user) => void) => {
			if (user) {
				resolve(user);
			} else {
				subscription?.unsubscribe();
				const { data } = supabase.auth.onAuthStateChange((event, session) => {
					user = session?.user;
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
		const { error } = await supabase.auth.signUp({
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
		if (error) throw new Error('invalid_password');
		return data;
	}

	private static async signInWithOAuthProvider(
		provider: (typeof supportedOAuthProviders)[number],
		options: SignInWithOAuthCredentials['options'] = {}
	) {
		return supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${import.meta.env.VITE_ENDPOINT_REDIRECT_URL}${
					import.meta.env.BASE_URL
				}profile?message=login_success`,
				...options,
			},
		});
	}

	static async signInWithGoogle() {
		const { data, error } = await this.signInWithOAuthProvider('google');
		if (error) return errorHandler(error);
		return data.url;
	}

	static async signInWithFacebook() {
		const { data, error } = await this.signInWithOAuthProvider('facebook');
		if (error) return errorHandler(error);
		return data.url;
	}

	static async signInWithGithub() {
		const { data, error } = await this.signInWithOAuthProvider('github');
		if (error) return errorHandler(error);
		return data.url;
	}

	static async logout() {
		const { error } = await supabase.auth.signOut();
		if (error) return errorHandler(error);
	}
}
