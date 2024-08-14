<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { makeCodeEditor, type Model } from './CodeEditor.svelte';
	import { getContext, persisted } from '$lib/global';
	import { contextMenu, themeControl } from '@selenite/graph-editor';
	import { untrack, type Snippet } from 'svelte';
	import { download, horizontalScroll } from '@selenite/commons';

	type Props = {
		width?: string;
		/** Additional buttons for the code editor toolbar. */
		additionalButtons?: Snippet;
		/** Whether download is available. Defaults to true. */
		downloadAvailable?: boolean;
	};
	let { width = 'w-full', additionalButtons, downloadAvailable = true }: Props = $props();
	const text = persisted('codeEditorText', '<?xml version="1.0"?>\n\n<Problem>\n  \n</Problem>');

	function saveCodeEditor() {
		if (!codeEditor || !model) return;
		console.warn(res?.codeEditor);
		$text = model.getValue();
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
			},
			get codeEditor() {
				return codeEditor;
			}
		};
	}
	export function getModel(): Model | undefined {
		return model;
	}

	export function setText(text: string) {
		codeEditor?.setText({ text });
	}

	export function clear() {
		codeEditor?.setText({ text: '' });
	}
	let model = $state<Model>();
	$effect(() => {
		if (!codeEditor) return;
		untrack(() => {
			model = codeEditor.createModel({
				language: 'geos_xml',
				value: $text
			});
			codeEditor.activeModel = model;
		});
	});

	// Handle dark mode
	$effect(() => {
		if (codeEditor) codeEditor.setLightTheme(themeControl.isLight);
	});

	function openFile(e: Event) {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.xml';
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const text = await file.text();
			codeEditor?.setText({ text });
			$filename = file.name.endsWith('.xml') ? file.name.slice(0, -4) : file.name;
		};
		input.click();
	}

	function saveFile(e: Event) {
		download(filenameWithXmlExtension, codeEditor?.getText().text);
	}

	const filename = persisted('codeEditorFilename', 'problem');
	const filenameWithXmlExtension = $derived(
		$filename.endsWith('.xml') ? $filename : `${$filename}.xml`
	);
</script>

<nav
	class="min-h-10 flex justify-between z-10 w-full shadow-m align-middle mb- overflow-x-auto overflow-y-clip scrollbar-thin"
	use:horizontalScroll
>
	{#snippet CodeEditorButton({
		label,
		onclick,
		needWritable,
		disabled
	}: {
		label?: string;
		onclick?: EventListener;
		needWritable?: boolean;
		disabled?: boolean;
	})}
		{@const unavailable = needWritable && codeEditor?.readonly}
		<button
			disabled={!codeEditor || disabled}
			class:opacity-0={unavailable}
			class:pointer-events-none={unavailable}
			class="text-sm btn btn-ghost btn-sm h-full rounded-none no-animation transition-all"
			{onclick}
		>
			{label ?? 'Button'}
		</button>
	{/snippet}
	<div class="flex items-center">
		{@render CodeEditorButton({ label: 'Open', onclick: openFile, needWritable: true })}
		{@render CodeEditorButton({ label: 'Download', onclick: saveFile, disabled: !downloadAvailable})}
		{@render CodeEditorButton({ label: 'Clear', onclick: clear, needWritable: true })}
		<input
			type="text"
			class="input input-sm truncate w-[10rem] opacity-80 focus:opacity-100"
			placeholder="Name"
			title={$filename}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === 'Escape') {
					e.currentTarget.blur();
				}
			}}
			bind:value={$filename}
		/>
	</div>
	{#if additionalButtons}
		{@render additionalButtons()}
	{/if}
</nav>
<div class="transition-colors overflow {width}">
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

