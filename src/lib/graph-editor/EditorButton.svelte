<script lang="ts">
	import { getContext } from '$lib/global';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import type { NodeFactory } from '@selenite/graph-editor';
	import type { Snippet } from 'svelte';
	import Fa from 'svelte-fa';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		class?: string;
		label?: string;
		icon?: IconDefinition | Snippet;
		activeFactoryAction?: (factory: NodeFactory) => void;
	} & HTMLButtonAttributes;

	const editorContext = getContext('editor');

	let { class: classes = '', label = 'Button', icon, ...props }: Props = $props();

	let displayIcon = $derived(icon !== undefined);
</script>

<button
	type="button"
	{...props}
	class:btn-circle={displayIcon}
	class:bg-opacity-50={displayIcon}
	class="btn bg-opacity-50 {classes} pointer-events-auto"
	onclick={(e) => {
		if (props.onclick) props.onclick(e);
		if (props.activeFactoryAction) {
			const factory = editorContext.activeFactory;
			if (factory) props.activeFactoryAction(factory);
		}
	}}
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
