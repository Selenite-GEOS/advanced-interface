import type { Tabs } from "$lib/tabs.svelte"
import { getContext as baseGetContext, setContext as baseSetContext} from "svelte"

/**
 * Available contexts through the context api.
 */
export type Contexts = {
    tabs: Tabs,
    saves: (() => void)[]
}

/** Retrieves the context that belongs to the closest parent component
 *  with the specified key. Must be called during component initialisation. */
export function getContext<T extends keyof Contexts>(key: T): Contexts[T] {
    return baseGetContext(key)
}

/**
 * Associates an arbitrary context object with the current component and the
 * specified key and returns that object. The context is then available to children
 * of the component (including slotted content) with getContext.
 *
 * Like lifecycle functions, this must be called during component initialisation.
 */
export function setContext<T extends keyof Contexts>(key: T, value: Contexts[T]): void {
    baseSetContext(key, value)
}