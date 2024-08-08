<script>
	import { faDownload } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
</script>

<EditorButton
	label="Download"
	icon={faDownload}
	class=""
	activeFactoryAction={(factory) => {
		factory.downloadGraph();
	}}
/>
