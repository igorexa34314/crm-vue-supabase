export const errorHandler = (err: unknown, msg?: string) => {
	if (err instanceof Error) {
		const messageCode = err.message.toLowerCase().split(' ').join('_');
		throw messageCode;
	}
	if (msg) {
		console.error(msg);
	}

	throw err;
};
