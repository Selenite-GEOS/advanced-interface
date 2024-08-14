<script lang="ts">
	import { faGem } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { ArrangeAppliers } from 'rete-auto-arrange-plugin';
	import { AreaExtensions } from 'rete-area-plugin';
	import type { Schemes, AreaExtra } from '@selenite/graph-editor';
	import { cubicInOut } from 'svelte/easing';
</script>

<EditorButton
	icon={faGem}
	shortcut="a"
    label="Arrange nodes"
    description="Arrange all nodes in the graph."
	activeFactoryAction={(factory) => {
		const selectedNodesIds = new Set(factory.selector.nodes.map((n) => n.id));
		if (selectedNodesIds) console.log('arranging nodes', selectedNodesIds);
		const area = factory.getArea();
		if (!area) return;
		let firstTick = true;
		const applier = new ArrangeAppliers.TransitionApplier<Schemes, AreaExtra>({
			onTick(t) {
				if (firstTick) {
					firstTick = true;
					AreaExtensions.zoomAt(area, factory.getEditor().getNodes());
				}
			},
			duration: 500,
			timingFunction: cubicInOut,
			needsLayout(id) {
				// if (factory.getSelectedNodesIds()?.size !== 0)
				// 	console.warn(
				// 		"laying out a subset doesn't work, should try reaching out to the author of the plugin"
				// 	);
				return !selectedNodesIds || selectedNodesIds.has(id);
			}
		});
        // @ts-expect-error
		factory.arrange?.layout({ applier });
	}}
/>
