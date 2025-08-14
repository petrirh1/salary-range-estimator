import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function deepEqual<T>(a: T, b: T) {
	if (a === b) return true;

	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
		return false;
	}

	const keysA = Object.keys(a as object);
	const keysB = Object.keys(b as object);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		const valA = (a as any)[key];
		const valB = (b as any)[key];
		if (!keysB.includes(key) || !deepEqual(valA, valB)) {
			return false;
		}
	}

	return true;
}
