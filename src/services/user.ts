import { errorHandler } from '@/utils/errorHandler';
import { useInfoStore, UserInfo } from '@/stores/info';
import { AuthService } from '@/services/auth';
import { TimestampToDate } from '@/services/record';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabase';
import { DEFAULT_BILL, DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/globals';

export interface UserCredentials {
	uid: string;
	email: string;
	displayName?: string;
}

export class UserService {
	static async createUser({ uid, displayName, ...user }: UserCredentials & Partial<UserInfo>) {
		return setDoc(
			doc(col(db, 'users'), uid),
			{
				info: {
					...user,
					email: user.email,
					bill: DEFAULT_BILL,
					firstName: displayName?.split(' ').at(0) || '',
					lastName: displayName?.split(' ').at(1) || '',
					gender: 'unknown',
					locale: DEFAULT_LOCALE,
					currency: DEFAULT_CURRENCY
				} as UserInfo
			},
			{ merge: true }
		);
	}

	static async getUserById(uid: UserCredentials['uid']) {
		return supabase.from('profiles').select().match({ id: uid });
	}

	static async fetchInfo() {
		try {
			const { setInfo } = useInfoStore();
			const uid = await AuthService.getUserId();
			if (uid) {
				return onSnapshot(doc(col(db, 'users'), uid), snapshot => {
					if (snapshot.exists() && Object.keys(snapshot.data()?.info).length) {
						const info = snapshot.data().info;
						if (info.birthdayDate) {
							info.birthdayDate = TimestampToDate(info.birthdayDate);
						}
						setInfo(info);
					}
				});
			}
		} catch (e) {
			errorHandler(e);
		}
	}

	static async updateUser(uid: UserCredentials['uid'], data: Partial<UserInfo>) {
		updateDoc(
			doc(col(db, 'users'), uid),
			Object.assign(
				{},
				...Object.keys(data).map(key => ({
					[`info.${key}`]: data[key as keyof UserInfo]
				}))
			)
		);
	}

	static async updateInfo(toUpdate: Partial<UserInfo>) {
		try {
			const uid = await AuthService.getUserId();
			const isEmailVerified = await AuthService.isEmailVerified();
			if (!isEmailVerified) {
				throw new Error('verify_error');
			}
			if (uid) {
				await this.updateUser(uid, toUpdate);
				await AuthService.updateUserProfile(toUpdate);
			}
		} catch (e) {
			errorHandler(e);
		}
	}

	static async updateUserAvatar(files: File[]) {
		try {
			if (files.length !== 1) {
				throw new Error('You should profide only 1 file');
			}
			const avatar = files[0];
			if (avatar instanceof File) {
				const uid = await AuthService.getUserId();
				const avatarRef = storageRef(
					storage,
					`userdata/${uid}/avatar/${uuidv4()}.${avatar.name.split('.').at(-1)}`
				);
				await uploadBytes(avatarRef, avatar, {
					contentType: avatar.type
				});
				const avatarURL = await getDownloadURL(avatarRef);
				await updateDoc(doc(col(db, 'users'), uid), {
					'info.photoURL': avatarURL
				});
			}
		} catch (e) {
			errorHandler(e);
		}
	}
}
