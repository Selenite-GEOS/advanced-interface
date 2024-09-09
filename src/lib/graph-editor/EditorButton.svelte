<script lang="ts">
	import { getContext } from '$lib/global';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import {
		shortcut,
		shortcutToString,
		type KeyboardShortcut,
		contextMenu
	} from '@selenite/commons';
	import type { NodeFactory } from '@selenite/graph-editor';
	import { upperFirst } from 'lodash-es';
	import type { Snippet } from 'svelte';
	import Fa from 'svelte-fa';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		class?: string;
		label?: string;
		icon?: IconDefinition | Snippet;
		description?: string;
		activeFactoryAction?: (factory: NodeFactory) => void;
		shortcut?: string | string[];
		shortcutInInput?: boolean;
	} & HTMLButtonAttributes;

	let {
		class: classes = '',
		label = 'Button',
		icon,
		description,
		shortcut: shortcutStr,
		shortcutInInput = false,
		...props
	}: Props = $props();
	const editorContext = getContext('editor');

	const shortcutDef = $derived.by(() => {
		if (!shortcutStr) return;
		const res: KeyboardShortcut[] = [];
		for (const s of Array.isArray(shortcutStr) ? shortcutStr : [shortcutStr]) {
			const pieces = new Set(s.split('+'));
			res.push({
				ctrl: pieces.has('ctrl'),
				shift: pieces.has('shift'),
				alt: pieces.has('alt'),
				key: [...pieces].find((p) => !['ctrl', 'shift', 'alt'].includes(p))
			});
		}
		return res;
	});

	let displayIcon = $derived(icon !== undefined);

	function triggerOnclick(e: Event) {
		if (props.onclick) props.onclick(e);
		if (props.activeFactoryAction) {
			const factory = editorContext.activeFactory;
			if (factory) props.activeFactoryAction(factory);
		}
	}
	const trimmedDescr = $derived(description ? description.trim() : '');
	const preppedDescr = $derived(
		(trimmedDescr
			? upperFirst(trimmedDescr.endsWith('.') ? trimmedDescr : trimmedDescr + '.')
			: upperFirst(label.trim())
		).replaceAll('\\n', '\n')
	);
	const title = $derived(
		preppedDescr +
			(shortcutDef ? `\n(${shortcutDef.map((s) => shortcutToString(s)).join(', ')})` : '')
	);
</script>

<button
	type="button"
	{title}
	{...props}
	class:btn-circle={displayIcon}
	use:shortcut={{
		ignoreElements: shortcutInInput ? [] : undefined,
		shortcuts: shortcutDef,
		action(node, e) {
			if (contextMenu.visible) return;
			triggerOnclick(e);
		}
	}}
	class:bg-opacity-50={displayIcon}
	class="btn bg-opacity-50 {classes} pointer-events-auto"
	onclick={triggerOnclick}
>
	{#if icon}
		{#if icon instanceof Function}
			{@render icon()}
		{:else}
			<Fa {icon} />
		{/if}
	{:else}
		{label}
	{/if}
</button>
