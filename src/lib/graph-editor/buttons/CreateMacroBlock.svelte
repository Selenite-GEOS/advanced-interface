<script lang="ts">
	import { faCube, faCubes, faCubesStacked, faPlus } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { Modal, type NodeFactory, notifications } from '@selenite/graph-editor';
	import Fa, { FaLayers } from 'svelte-fa';
	import UpdateGraphModal from '../data/UpdateGraphModal.svelte';

	function createMacroBlock(factory: NodeFactory) {
		factory.openGraphForm();
		// Modal.instance.show({
		// 	component: UpdateGraphModal,
		// 	props: {},
		// 	buttons: ['cancel'],
		// 	get title() {
		// 		return `Update macro block ${factory.editor.graphName}`;
		// 	}
		// });
	}
</script>

<EditorButton
	activeFactoryAction={createMacroBlock}
	shortcut={['c', 'u']}
	description="create or update a macro block"
	label="Create Macro Block"
>
	{#snippet icon()}
		<FaLayers>
			<Fa icon={faCube} translateX={-0.3} translateY={0.2} />
			<Fa icon={faPlus} translateX={0.7} translateY={-0.5} size={'sm'} />
		</FaLayers>
	{/snippet}
</EditorButton>
