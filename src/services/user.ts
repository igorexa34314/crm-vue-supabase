import { errorHandler } from '@/utils/errorHandler';
import { useInfoStore, UserInfo } from '@/stores/info';
import { AuthService } from '@/services/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/supabase';
import { Tables } from '@/database.types';

export interface UserCredentials {
	uid: string;
	email: string;
	displayName?: string;
}

export class UserService {
	static async getUserById(uid: UserCredentials['uid']) {
		const { error, data } = await supabase.from('profiles').select('*').eq('id', uid).single();
		if (error) throw error;
		const { updated_at, ...user } = data;
		return user;
	}

	static subscribeInfo(uid: UserInfo['id'], cb: (pl: UserInfo) => void) {
		return supabase
			.channel('schema-db-changes')
			.on<Tables<'profiles'>>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'profiles',
					filter: `id=eq.${uid}`
				},
				payload => {
					if (Object.keys(payload.new).length) {
						const { updated_at, ...info } = payload.new as UserInfo & { updated_at: string };
						cb(info);
					}
				}
			)
			.subscribe();
	}

	static async fetchAndSubscribeInfo() {
		try {
			const { setInfo } = useInfoStore();
			const uid = await AuthService.getUserId();
			const info = await UserService.getUserById(uid);
			setInfo(info);
			return UserService.subscribeInfo(uid, userInfo => {
				setInfo(userInfo);
			});
		} catch (err) {
			errorHandler(err);
		}
	}

	static async updateUserInfo(data: Partial<UserInfo>) {
		const uid = await AuthService.getUserId();
		// 	const isEmailVerified = await AuthService.isEmailVerified();
		// 	if (!isEmailVerified) {
		// 		throw new Error('verify_error');
		// 	}
		return supabase.from('profiles').update(data).eq('id', uid);
	}

	static async updateUserAvatar(files: File[]) {
		try {
			if (files.length !== 1) {
				throw new Error('You should profide only 1 file');
			}
			const avatar = files[0];
			if (avatar instanceof File) {
				const uid = await AuthService.getUserId();
				const { error, data } = await supabase.storage
					.from('avatars')
					.upload(`${uid}/${uuidv4()}.${avatar.name.split('.').at(-1)}`, avatar);
				if (error) throw error;
				if (data.path) {
					const {
						data: { publicUrl }
					} = supabase.storage.from('avatars').getPublicUrl(data.path);
					await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', uid);
				}
			}
		} catch (e) {
			errorHandler(e);
		}
	}
}
