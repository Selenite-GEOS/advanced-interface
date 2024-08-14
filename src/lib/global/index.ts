export * from './context.svelte';
export * from './theme.svelte';
import { persisted as basePersisted } from '@selenite/commons';
import { readable } from 'svelte/store';

export function persisted<T>(
	key: string,
	initialValue: T,
	options?: Parameters<typeof basePersisted<T, T>>[2]
) {
	return basePersisted<T>('selenite-graph-' + key, initialValue, options);
}


export const _ = readable((s: string) => s);