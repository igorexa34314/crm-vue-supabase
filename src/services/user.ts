import { errorHandler } from '@/utils/errorHandler';
import { useUserStore } from '@/stores/user';
import { AuthService } from '@/services/auth';
import { supabase } from '@/supabase';
import type { Tables } from '@/database.types';
import { v4 as uuidv4 } from 'uuid';
import { validateFileName } from '@/utils/helpers';

export interface UserCredentials {
	uid: string;
	email: string;
	displayName?: string;
}
export type UserInfo = Tables<'profiles'>;

export class UserService {
	static async getUserInfo() {
		const uid = await AuthService.getUserId();
		const { error, data: user } = await supabase.from('profiles').select('*').eq('id', uid).single();
		if (error) return errorHandler(error);
		return user;
	}

	static async subscribeInfo(cb: (pl: UserInfo) => void) {
		const uid = await AuthService.getUserId();
		return supabase
			.channel('schema-db-changes')
			.on<Tables<'profiles'>>(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'profiles',
					filter: `id=eq.${uid}`,
				},
				payload => {
					if (Object.keys(payload.new).length) {
						const info = payload.new as UserInfo;
						cb(info);
					}
				}
			)
			.subscribe();
	}

	static async fetchAndSubscribeInfo() {
		const { setInfo } = useUserStore();
		const info = await UserService.getUserInfo();
		setInfo(info);
		return UserService.subscribeInfo(userInfo => {
			setInfo(userInfo);
		});
	}

	static async updateInfo(data: Partial<UserInfo>) {
		const uid = await AuthService.getUserId();
		return supabase.from('profiles').update(data).eq('id', uid);
	}

	static async updateAvatar(files: File[]) {
		if (files.length !== 1) {
			throw new Error('You should profide only 1 file');
		}
		const avatar = files[0];
		const uid = await AuthService.getUserId();
		if (!uid) {
			throw new Error('user_unauthenticated');
		}
		const { error, data } = await supabase.storage
			.from('avatars')
			.upload(`${uid}/${uuidv4()}__${validateFileName(avatar.name)}`, avatar);
		if (error) return errorHandler(error);
		return data.path;
	}
}
