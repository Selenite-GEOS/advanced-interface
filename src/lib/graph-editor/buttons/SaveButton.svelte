<script>
	import { getContext } from '$lib/global';
	import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

	import EditorButton from '../EditorButton.svelte';

	const save = getContext('save');
</script>

<EditorButton label="Save" icon={faFloppyDisk} class="dbtn-neutral" onclick={() => save()} />
