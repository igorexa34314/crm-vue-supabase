export function isLatinic(str: string) {
	return /^[a-zA-Z0-9._\-()\s]+$/.test(str);
}

export function validateFileName(name: string) {
	return isLatinic(name) ? name : name.split('.').at(-1);
}
