export function isLatinic(str: string) {
	return /^[a-zA-Z0-9._\-()\s]+$/.test(str);
}

export function arrayAt<T>(arr: T[], index: number): T | undefined {
	if (index < 0) {
		index = arr.length + index;
	}
	return arr[index];
}

export function validateFileName(name: string) {
	return isLatinic(name) ? name : arrayAt(name.split('.'), -1);
}
