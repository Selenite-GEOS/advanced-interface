<script lang="ts">
	import { getContext } from '$lib/global';
	import { animationFrame, type SaveData } from '@selenite/commons';
	import {
		type NodeEditor,
		NodeFactory,
		type NodeMenuItem,
		nodeRegistry,
		setupFullGraphEditor,
		setupSvelteRender,
		themeControl,
		xmlNodeItems
	} from '@selenite/graph-editor';
	import { untrack } from 'svelte';
	let container = $state<HTMLElement>();

	type Props = {
		editor?: NodeEditor;
		factory?: NodeFactory;
		saveData?: SaveData<NodeEditor>;
		class?: string;
	};
	let { saveData, editor = $bindable(), factory = $bindable(), class: classes }: Props = $props();

	const geosContext = getContext('geos');
	$effect(() => {
		if (!container || !geosContext.schema) return;
		untrack(() => {
			setup();
		})

		return () => {
			factory?.destroyArea();
			editor = undefined;
			factory = undefined;
		};
	});
	async function setup() {
		await animationFrame(10);
		const schema = geosContext.schema;
		if (!schema) {
			throw new Error('Missing schema for editor setup.');
		}
		const res = await setupFullGraphEditor({
			container,
			xmlSchemas: {
				geos: schema
			},
			additionalNodeItems: [
				...xmlNodeItems({
					schema,
					basePath: ['GEOS'],
					priorities: {
						Problem: {
							Solvers: 10,
							Mesh: 9,
							Geometry: 8,
							Events: 7,
							ElementRegions: 6,
							NumericalMethods: 5,
							Constitutive: 4,
							FieldSpecifications: 3,
							Functions: 2,
							Outputs: 1
						}
					}
				})
			],
			saveData,
			setups: [setupSvelteRender]
		});
		setTimeout(() => {
			editor = res.editor;
			factory = res.factory;
		}, 10);
	}

	// Gridline updates
	$effect(() => {
		themeControl.isLight;
		editor?.area?.emit({ type: 'gridline-update' });
	});
</script>

<section
	bind:this={container}
	class="transition-opacity duration-200 {classes}"
	class:!opacity-0={factory === undefined}
></section>
