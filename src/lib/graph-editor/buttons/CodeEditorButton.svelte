<script>
	import EditorButton from '../EditorButton.svelte';
	import { faFileCode } from '@fortawesome/free-solid-svg-icons';
	import { getContext } from '$lib/global';

	const editorContext = getContext('editor');
</script>

<EditorButton
	label="Code Editor"
	description={'toggle the code editor integration.\nThis integration allows you to go from graph to code and back'}
	shortcut={["shift+c", "alt+c"]}
	icon={faFileCode}
	class=""
	activeFactoryAction={(factory) => {
		editorContext.displayCodeEditor = !editorContext.displayCodeEditor;
	}}
/>
