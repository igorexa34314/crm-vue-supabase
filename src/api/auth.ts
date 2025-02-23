import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/config/supabase';
import { defaultBill } from '@/constants/app';
import type {
	SignInWithOAuthCredentials,
	Subscription,
	User,
	UserAttributes,
} from '@supabase/supabase-js';
import { joinURL, withQuery } from 'ufo';

export interface UserCredentials extends Required<Pick<UserAttributes, 'email' | 'password'>> {
	username?: string;
}

export const supportedOAuthProviders = ['google', 'facebook', 'github'] as const;

let user: User | null = null;
let subscription: Subscription;

export const getCurrentUser = () => {
	return new Promise((resolve: (currentUser: User | null) => void) => {
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
};

export const getUserId = async () => {
	const user = await getCurrentUser();
	if (!user) {
		throw new Error('User unauthenticated');
	}
	return user.id;
};

export const login = async ({ email, password }: UserCredentials) => {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw errorHandler(error);
	return data.user;
};

export const register = async ({ email, password, username }: UserCredentials) => {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				username,
				bill: defaultBill,
			},
		},
	});
	if (error) throw errorHandler(error);
	return data.user;
};

export const changeUserEmail = async (newEmail: string) => {
	const redirectUrl = import.meta.env.VITE_ENDPOINT_REDIRECT_URL;
	const baseUrl = import.meta.env.BASE_URL;
	const { data, error } = await supabase.auth.updateUser(
		{ email: newEmail },
		{
			emailRedirectTo: withQuery(joinURL(redirectUrl, baseUrl, '/profile'), {
				message: 'password_changed',
			}),
		}
	);
	if (error) throw errorHandler(error);
	return data.user;
};

export const changeUserPassword = async (oldPass: string, newPass: string) => {
	const { error, data } = await supabase.rpc('change_user_password', {
		current_password: oldPass,
		new_password: newPass,
	});
	if (error) throw errorHandler(error);
	return data;
};

const signInWithOAuthProvider = async (
	provider: (typeof supportedOAuthProviders)[number],
	options: SignInWithOAuthCredentials['options'] = {}
) => {
	const redirectUrl = import.meta.env.VITE_ENDPOINT_REDIRECT_URL;
	const baseUrl = import.meta.env.BASE_URL;
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: withQuery(joinURL(redirectUrl, baseUrl, '/profile'), {
				message: 'login_success',
			}),
			...options,
		},
	});
	if (error) throw errorHandler(error);
	return data.url;
};

export const signInWithGoogle = async () => {
	return signInWithOAuthProvider('google');
};

export const signInWithFacebook = async () => {
	return signInWithOAuthProvider('facebook');
};

export const signInWithGithub = async () => {
	return signInWithOAuthProvider('github');
};

export const logout = async () => {
	const { error } = await supabase.auth.signOut();
	if (error) throw errorHandler(error);
};
