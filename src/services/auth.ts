import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';
import { DEFAULT_BILL } from '@/globals';

export interface UserCredentials {
	email: string;
	password: string;
	username?: string;
}

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
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();
		if (error || !user || !user.id) {
			throw new Error('User unauthenticated');
		}
		return user.id;
	}

	// static async changeUserEmail(newEmail: string) {
	// 	try {
	// 	  await supabase.auth.r
	// 	} catch (e) {
	// 		errorHandler(e);
	// 	}
	// }

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

	// static async updateUserProfile(userdata: { displayName?: string; photoURL?: string }) {
	// 	try {
	// 		if (user) {
	// 			updateProfile(user, userdata);
	// 		}
	// 	} catch (e) {
	// 		errorHandler(e);
	// 	}
	// }

	// static async isEmailVerified() {
	// 	const user = await getCurrentUser();
	// 	if (!user || !user.uid) {
	// 		throw new Error('User unauthenticated');
	// 	}
	// 	return user.emailVerified;
	// }

	private static async signInWithPopup(provider: any) {
		return supabase.auth.signInWithOAuth({
			provider,
			options: {
				// redirectTo: 'http://localhost:3000'
			}
		});
		// const { uid, email, displayName, photoURL } = user;
		// const isUserExists = (await UserService.getUserById(uid)).exists();
		// if (!isUserExists) {
		// 	await sendEmailVerification(user);
		// 	await UserService.createUser({
		// 		uid: uid,
		// 		email: email || '',
		// 		photoURL: photoURL || '',
		// 		displayName: displayName || '',
		// 		username: email?.split('@').at(0) || `user-${uid}`
		// 	});
		// }
		// return user;
	}

	static async signInWithGoogle() {
		try {
			const { data, error } = await this.signInWithPopup('google');
			if (error) throw error;
		} catch (err) {
			errorHandler(err);
		}
	}

	// static async signInWithFacebook() {
	// 	try {
	// 		const provider = new FacebookAuthProvider();
	// 		provider.addScope('user_birthday');
	// 		provider.addScope('user_gender');

	// 		await this.signInWithPopup(provider);
	// 	} catch (err) {
	// 		this.handleAccountExistsError(err);
	// 		errorHandler(err);
	// 	}
	// }

	// private static async handleAccountExistsError(err: unknown) {
	// 	if (err instanceof FirebaseError && err.code === 'auth/account-exists-with-different-credential') {
	// 		const email = err.customData?.email;
	// 		if (email && typeof email === 'string') {
	// 			const credential = GithubAuthProvider.credentialFromError(err);

	// 			if (!credential) {
	// 				throw new Error(`Your account credentials are invalid`);
	// 			}

	// 			const providers = await fetchSignInMethodsForEmail(auth, email);

	// 			let user: User | undefined;

	// 			const firstPopupProviderMethod = providers.find(p =>
	// 				Object.values(supportedPopupSignInMethods).includes(
	// 					p as (typeof supportedPopupSignInMethods)[keyof typeof supportedPopupSignInMethods]
	// 				)
	// 			) as (typeof supportedPopupSignInMethods)[keyof typeof supportedPopupSignInMethods];

	// 			if (firstPopupProviderMethod === supportedPopupSignInMethods.email) {
	// 				const password = prompt('Please provide the password for ' + email);
	// 				user = await this.login({
	// 					email: email,
	// 					password: password || ''
	// 				});
	// 			} else {
	// 				const provider = getProvider(firstPopupProviderMethod);
	// 				// Sign in user to Google with same account.
	// 				provider.setCustomParameters({
	// 					'login_hint': email
	// 				});
	// 				user = await this.signInWithPopup(provider);
	// 			}

	// 			if (user) {
	// 				return linkWithCredential(user, credential);
	// 			}
	// 		}
	// 	}
	// }

	// static async signInWithGithub() {
	// 	try {
	// 		const provider = new GithubAuthProvider();
	// 		provider.addScope('user_birthday');
	// 		provider.addScope('user_gender');

	// 		await this.signInWithPopup(provider);
	// 	} catch (err) {
	// 		this.handleAccountExistsError(err);
	// 		errorHandler(err);
	// 	}
	// }

	static async logout() {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (err) {
			errorHandler(err);
		}
	}
}

const supportedPopupSignInMethods = {
	google: 'google',
	fb: 'facebook',
	gh: 'github'
} as const;
