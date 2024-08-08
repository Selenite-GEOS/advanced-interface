import type { Tabs } from '$lib/tabs.svelte';
import { XmlSchema } from '@selenite/commons';
import type { NodeFactory } from '@selenite/graph-editor';
import { getContext as baseGetContext, setContext as baseSetContext } from 'svelte';

export class GeosContext {
	schema = $state<XmlSchema>();
}

/**
 * Available contexts through the context api.
 */
export type Contexts = {
	tabs: Tabs;
	saves: Set<() => void>;
	/** Save function to save everything. */
	save: () => void;

	/** Editor context */
	editor: {
		factories: NodeFactory[];
		activeFactory?: NodeFactory;
		displayCodeEditor: boolean;
	};
	geos: GeosContext;
};

/** Retrieves the context that belongs to the closest parent component
 *  with the specified key. Must be called during component initialisation. */
export function getContext<T extends keyof Contexts>(key: T): Contexts[T] {
	return baseGetContext(key);
}

/**
 * Associates an arbitrary context object with the current component and the
 * specified key and returns that object. The context is then available to children
 * of the component (including slotted content) with getContext.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 */
export function setContext<T extends keyof Contexts>(key: T, value: Contexts[T]): void {
	baseSetContext(key, value);
}
