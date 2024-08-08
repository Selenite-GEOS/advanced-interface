<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { makeCodeEditor } from './CodeEditor.svelte';
	import { getContext, persisted } from '$lib/global';
	import { contextMenu, themeControl } from '@selenite/graph-editor';

	type Props = {
		width?: string;
		height?: string;
		border?: string;
	};
	let { width = '100%', height = '100%', border = '' }: Props = $props();
	const text = persisted('codeEditorText', '<?xml version="1.0"?>\n\n<Problem>\n  \n</Problem>');

	function saveCodeEditor() {
		if (!codeEditor) return;
		console.warn(res?.codeEditor);
		$text = codeEditor.getText().text;
	}

	const saves = getContext('saves');
	$effect(() => {
		saves.add(saveCodeEditor);
		return () => saves.delete(saveCodeEditor);
	});

	const geosContext = getContext('geos');
	const geosSchema = $derived(geosContext.schema);
	const res = $derived(
		geosSchema
			? makeCodeEditor({
					backend: 'monaco',
					geosSchema
				})
			: undefined
	);

	const codeEditorAction = $derived(res?.codeEditorAction);
	const codeEditor = $derived(res?.codeEditor);
	const codeEditorPromise = $derived(res?.codeEditorPromise);

	export function getCodeEditorContext() {
		return {
			get codeEditorPromise() {
				return codeEditorPromise;
			}
		};
	}

	$effect(() => {
		if (!codeEditor) return;
		codeEditor.createModel({
			language: 'geos_xml',
			value: $text
		});
	});

	// Handle dark mode
	$effect(() => {
		if (codeEditor) codeEditor.setLightTheme(themeControl.isLight);
	});
</script>

<div
	class="{border} transition-colors overflow"
	style="width: {width}; height: {height};"
	transition:slide={{ axis: 'x', duration: 200 }}
>
	{#await codeEditorPromise}
		<div class="w-full flex justify-center p-2">Loading...</div>
	{:then}
		{#if codeEditorAction}
			<div class="h-full w-full" use:codeEditorAction transition:fade={{ duration: 100 }}></div>
		{/if}
	{:catch}
		<div class="absolute top-0 h-full flex flex-col justify-center align-middle">
			<div class="card p-4 variant-filled-error mx-4 my-auto">
				Failed to load editor, check your internet connectivity.
			</div>
		</div>
	{/await}
</div>
