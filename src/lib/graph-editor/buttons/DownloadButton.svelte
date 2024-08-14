<script>
	import { faDownload } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
</script>

<EditorButton
	label="Download"
	description="Download the graph as a JSON file."
	shortcut="d"
	icon={faDownload}
	class=""
	activeFactoryAction={(factory) => {
		factory.downloadGraph();
	}}
/>
