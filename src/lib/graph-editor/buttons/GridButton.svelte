<script lang="ts">
	import { getContext, persisted } from '$lib/global';
	import { NodeFactory } from '@selenite/graph-editor';

	import EditorButton from '../EditorButton.svelte';
	import { faTableCells } from '@fortawesome/free-solid-svg-icons';
	import SmallEditorButton from '../SmallEditorButton.svelte';

	let isGridDisplayed = persisted('isGridDisplayed', true);

	const knownFactories = new Set<NodeFactory>();

	const editorContext = getContext('editor');
	const factories = $derived(editorContext.factories);

	$effect(() => {
		for (const f of factories) {
			if (knownFactories.has(f)) continue;
			knownFactories.add(f);
			if (!$isGridDisplayed) {
				f.area?.emit({ type: 'gridline-toggle-visibility' });
			}
		}
	});

	function toggleGrids() {
		$isGridDisplayed = !$isGridDisplayed;
		for (const f of factories) {
			f.area?.emit({ type: 'gridline-toggle-visibility' });
		}
	}
</script>

<SmallEditorButton
	label="Grid"
	description="Toggle the grid."
	shortcut="g"
	icon={faTableCells}
	class={$isGridDisplayed ? '' : 'text-opacity-50'}
	onclick={toggleGrids}
/>
