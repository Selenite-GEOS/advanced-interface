<script>
	import EditorButton from '$lib/graph-editor/EditorButton.svelte';
	import { getContext } from 'svelte';

	const editorContext = getContext('editor');

	const enabled = $derived(editorContext.activeFactory?.selection.boxSelectionEnabled ?? false);
</script>

<EditorButton
	label="Box Selection"
	description="Toggle box selection.\nIn box selection, select elements by drawing a box around them."
	shortcut="b"
	class={enabled ? 'btn-success' : ''}
	activeFactoryAction={async (factory) => {
		factory.selection.boxSelectionEnabled = !factory.selection.boxSelectionEnabled;
	}}
>
	{#snippet icon()}
		<div
			class="border-base-content w-4 h-4 border-dashed border-[0.12rem] border-opacity-90"
			class:!border-success-content={enabled}
		></div>
	{/snippet}
</EditorButton>
