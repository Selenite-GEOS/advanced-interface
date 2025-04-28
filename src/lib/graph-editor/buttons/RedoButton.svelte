<script lang="ts">
	import { faRotateRight } from '@fortawesome/free-solid-svg-icons';

	import { getContext } from '$lib/global';
	import { readable } from 'svelte/store';
	import type { Readable } from 'svelte/store';
	import SmallEditorButton from '../SmallEditorButton.svelte';

	const context = getContext('editor');
	const factory = $derived(context.activeFactory);
	const canRedo: Readable<boolean> = $derived(
		factory?.history ? factory.history.canRedo : readable(false)
	);
</script>

<SmallEditorButton
	label="Redo"
	shortcut={['ctrl+shift+z', 'ctrl+y']}
	icon={faRotateRight}
	class="hover:btn-success  {$canRedo ? 'not-hover:text-success' : 'bg-transparent!'}"
	disabled={!$canRedo}
	activeFactoryAction={(factory) => {
		factory.bulkOperation(() => {
			factory.history?.redo();
		});
	}}
/>
