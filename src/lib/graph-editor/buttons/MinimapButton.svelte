<script lang="ts">
	import { getContext, persisted } from '$lib/global';
	import { NodeFactory } from '@selenite/graph-editor';

	import EditorButton from '../EditorButton.svelte';
	import { faMap, faTableCells } from '@fortawesome/free-solid-svg-icons';
	import SmallEditorButton from '../SmallEditorButton.svelte';
	import { untrack } from 'svelte';

	let minimap = persisted('minimap', true);

	const knownFactories = new Set<NodeFactory>();

	const editorContext = getContext('editor');
	const factories = $derived(editorContext.factories);

	$effect(() => {
		for (const f of factories) {
			untrack(() => {
				f.minimapEnabled = $minimap;
			});
		}
	});

	function toggleMap() {
		$minimap = !$minimap;
		for (const f of factories) {
			f.minimapEnabled = $minimap;
		}
	}
</script>

<SmallEditorButton
	label="Minimap"
	description="Toggle the minimap."
	shortcut="m"
	icon={faMap}
	class={$minimap ? '' : 'text-opacity-50'}
	onclick={toggleMap}
/>
