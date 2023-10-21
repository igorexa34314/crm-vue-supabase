const isLatinic = (str: string) => {
	return /^[a-zA-Z0-9._\-()\s]+$/.test(str);
};

export const validateFileName = (name: string) => {
	isLatinic(name) ? name : name.split('.').at(-1);
};
