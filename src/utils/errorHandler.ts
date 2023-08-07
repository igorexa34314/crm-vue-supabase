import { FirebaseError } from 'firebase/app';

export const errorHandler = (err: unknown, msg?: string, errData?: any) => {
	if (err instanceof FirebaseError) {
		const errorCode = err.code;
		const errorMessage = err.message;
		// The email of the user's account used.
		const email = err.customData?.email;

		console.error(errorCode, errorMessage, email, errData);
		throw errorCode;
	} else if (err instanceof Error) {
		console.error(err, msg, errData);
		throw err.message.toString().split(' ').join('_');
	}
	throw err;
};
