<script lang="ts">
	import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';

	import { getContext } from '$lib/global';
	import { readable, type Readable } from 'svelte/store';
	import SmallEditorButton from '../SmallEditorButton.svelte';
	const context = getContext('editor');
	const factory = $derived(context.activeFactory);
	const canUndo: Readable<boolean> = $derived(
		factory?.history?.canUndo ? factory.history.canUndo : readable(false)
	);
</script>

<SmallEditorButton
	label="Undo"
	shortcut="ctrl+z"
	icon={faRotateLeft}
	class="hover:btn-warning  text-warning {$canUndo ? '' : '!bg-transparent'}"
	disabled={!$canUndo}
	activeFactoryAction={(factory) => {
		factory.bulkOperation(() => {
			factory?.history?.undo();
		});
	}}
/>
