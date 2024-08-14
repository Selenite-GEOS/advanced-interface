<script>
	import { getContext } from '$lib/global';
	import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

	import EditorButton from '../EditorButton.svelte';

	const save = getContext('save');
</script>

<EditorButton label="Save" description="Save all graphs and the code editor.&#013;(Ctrl+S)" icon={faFloppyDisk} class="dbtn-neutral" onclick={() => save()} />
