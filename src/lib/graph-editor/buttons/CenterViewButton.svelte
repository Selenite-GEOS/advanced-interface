<script>
	import { faArrowsToEye } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
</script>

<EditorButton
	label="Center View"
	description={"Center the view on the selected nodes, or on all nodes if none are selected.\nYou can also focus a node with a double click."}
	shortcut="f"
	icon={faArrowsToEye}
	class=""
	activeFactoryAction={(factory) => {
		const nodes = factory.selector.nodes;
		factory.centerView(nodes.length > 0 ? nodes : undefined);
	}}
/>
