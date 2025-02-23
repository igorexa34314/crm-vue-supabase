import { errorHandler } from '@/utils/errorHandler';
import { useUserStore } from '@/stores/user';
import { getUserId } from '@/api/auth';
import { supabase } from '@/config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { validateFileName } from '@/utils/helpers';
import type { Tables } from '@/types/database-generated';

export interface UserCredentials {
	uid: string;
	email: string;
	displayName?: string;
}
export type UserInfo = Tables<'profiles'>;

export const getUserInfo = async () => {
	const uid = await getUserId();
	const { error, data: user } = await supabase.from('profiles').select('*').eq('id', uid).single();
	if (error) throw errorHandler(error);
	return user;
};

export const subscribeInfo = async (cb: (pl: UserInfo) => void) => {
	const uid = await getUserId();
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
};

export const fetchAndSubscribeInfo = async () => {
	const { setInfo } = useUserStore();
	const info = await getUserInfo();
	setInfo(info);
	return subscribeInfo(userInfo => {
		setInfo(userInfo);
	});
};

export const updateInfo = async (data: Partial<UserInfo>) => {
	const uid = await getUserId();
	return supabase.from('profiles').update(data).eq('id', uid);
};

export const updateAvatar = async (file: File) => {
	const uid = await getUserId();
	if (!uid) {
		throw new Error('user_unauthenticated');
	}
	const { error, data } = await supabase.storage
		.from('avatars')
		.upload(`${uid}/${uuidv4()}__${validateFileName(file.name)}`, file);
	if (error) throw errorHandler(error);
	return data.path;
};
