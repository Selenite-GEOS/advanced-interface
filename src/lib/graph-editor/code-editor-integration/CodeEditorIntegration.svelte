<script lang="ts">
	import { CodeEditorComponent } from '$lib/code-editor';
	import { contextMenu, ErrorWNotif, notifications, XMLData, XmlNode } from '@selenite/graph-editor';
	// import { ErrorWNotif, getContext, _ } from '$lib/global';
	import 'regenerator-runtime/runtime';
	import wu from 'wu';
	import { _, persisted } from '$lib/global';
	import {
		parseXml,
		type ParsedXmlNodes,
		formatXml,
		getElementFromParsedXml,
		getXmlAttributes,

		shortcut

	} from '@selenite/commons';
	import { AutoArrangePlugin, Presets as ArrangePresets } from 'rete-auto-arrange-plugin';
	import {
		type Schemes,
		type Node,
		type NodeSaveData,
		type AreaExtra,
		GetNameNode
	} from '@selenite/graph-editor';
	import { AreaExtensions, AreaPlugin, type NodeView } from 'rete-area-plugin';

	import type { XmlSchema } from '@selenite/commons';
	import { get } from 'svelte/store';
	import { getContext } from '$lib/global';
	import CodeEditorIntegrationButton from './CodeEditorIntegrationButton.svelte';
	import { faArrowDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { fade, slide } from 'svelte/transition';
	import { untrack } from 'svelte';
	// import type { XmlAttributeDefinition } from "@sel";
	const editorContext = getContext('editor');
	const geosContext = getContext('geos');

	const geosSchema = $derived(geosContext.schema);
	let codeEditorCmpnt = $state<CodeEditorComponent>();
	const codeEditorPromise = $derived(codeEditorCmpnt?.getCodeEditorContext().codeEditorPromise);
	const codeEditor = $derived(codeEditorCmpnt?.getCodeEditorContext().codeEditor);
	const cursorTag = 'cursorPositioooon';

	/**
	 * Pulls the selected nodes from the graph editor to the code editor
	 */
	async function toCodeEditor() {
		if (!codeEditorPromise) return;
		const codeEditor = await codeEditorPromise;
		const factory = editorContext.activeFactory;
		if (!factory) throw new ErrorWNotif('No active editor');
		if (!geosSchema) throw new ErrorWNotif('No geos schema');

		const { text, cursorOffset } = codeEditor.getText();
		// let preppedText = text;
		// if (cursorOffset !== null)
		// 	preppedText = text.slice(0, cursorOffset) + `<${cursorTag}/>` + text.slice(cursorOffset);
		const res = await factory.codeIntegration.toCode({ schema: geosSchema, text });

		codeEditor.setText({ text: res });
	}
	/**
	 * Pushes the selected text from the code editor to the graph editor
	 */
	async function push() {
		if (!geosSchema) throw new ErrorWNotif('No geos schema');
		if (!codeEditorPromise) return;
		const { NodeEditor, NodeFactory } = await import('@selenite/graph-editor');
		const rootTypes = ['Problem', ...Object.keys(geosSchema.tree['Problem'] ?? {})];
		const factory = editorContext.activeFactory;
		if (!factory) throw new ErrorWNotif('No active editor');
		const editor = factory.editor;
		const codeEditor = await codeEditorPromise;
		const selectedText = codeEditor.getSelectedText();
		const full_xml = parseXml(selectedText);
		console.debug('full xml', full_xml);
		const tmp_editor = new NodeEditor();
		const tmp_container = document.createElement('div');
		const tmp_area = new AreaPlugin<Schemes, AreaExtra>(tmp_container);
		tmp_editor.use(tmp_area);

		const arrange = new AutoArrangePlugin<Schemes>();
		arrange.addPreset(ArrangePresets.classic.setup());
		tmp_area.use(arrange);

		const tmp_factory = new NodeFactory({
			editor: tmp_editor,
			area: tmp_area
		});
		const nameToXmlNode = new Map<string, XmlNode>();
		const groupNameLinks: {
			source: string;
			target: { node: Node; key: string };
		}[] = [];

		/**
		 * Recursively converts the parsed xml to editor nodes
		 */
		async function xmlToEditor(xml: ParsedXmlNodes, schema: XmlSchema, parent?: Node) {
			for (const xmlNode of xml) {
				const xmlTag = getElementFromParsedXml(xmlNode);

				const complexType = schema.complexTypes.get(xmlTag ?? '');
				if (!complexType) {
					console.warn('Complex type not found');
					continue;
				}

				if (!xmlTag) throw new ErrorWNotif('Missing xml tag in parsed xml node');
				const hasNameAttribute = complexType.attributes.has('name');
				const xmlAttributes: Record<string, unknown> = getXmlAttributes(
					xmlNode as Record<string, ParsedXmlNodes>
				);
				const arrayAttrs = new Map<string, string[]>();
				for (const [k, v] of Object.entries(xmlAttributes as Record<string, string>)) {
					const attrDef = complexType.attributes.get(k);

					if (!attrDef) {
						console.warn('Attribute type not found', k, v);
						continue;
					}

					if (attrDef.type === 'R1Tensor') {
						const a = v
							.slice(1, -1)
							.split(',')
							.map((t) => t.trim());
						console.log('R1Tensor', a, { x: a[0], y: a[1], z: a[2] });
						xmlAttributes[k] = { x: a[0], y: a[1], z: a[2] };
						continue;
					}

					if (attrDef.type.endsWith('Tensor')) {
						continue;
					}

					const isArray = /^\s*?\{\s*?/.test(v);
					if (!isArray) continue;

					type XMLArray = string[];
					type XMLNestedArrays = XMLArray[] | XMLArray;
					const candidate = JSON.parse(
						v
							.replaceAll('{', '[')
							.replaceAll('}', ']')
							.replaceAll(/[a-zA-Z0-9.\-_/]+/g, (t) => {
								console.log('t', t);
								// if (t === '') return '';
								// if (t === ',') return ',';
								return `"${t}"`;
							})
					) as XMLNestedArrays | undefined;

					if (candidate === undefined) continue;
					if (attrDef.type.startsWith('real') && attrDef.type.endsWith('array2d')) {
						console.log('candidate', candidate);
						xmlAttributes[k] = candidate.map((t) => {
							if (typeof t === 'string')
								throw new ErrorWNotif('Expected array for type real array2d');
							return { x: t[0], y: t[1], z: t[2] };
						});
						arrayAttrs.set(attrDef.name, xmlAttributes[k] as string[]);
						continue;
					}
					// put nested arrays back to xml notation
					// maybe later all kinds of nested arrays will be supported
					// and this will become obsolete
					function arraysToXmlNotation(a: string[] | string): string {
						if (typeof a === 'string') return a; // removes " "
						return (
							'{ ' +
							a
								.map((t) => {
									if (Array.isArray(t)) return arraysToXmlNotation(t);
									return t; // removes " "
								})
								.join(', ') +
							' }'
						);
					}
					const array1d = candidate.map(arraysToXmlNotation);
					xmlAttributes[k] = array1d;
					arrayAttrs.set(attrDef.name, array1d);
				}
				console.log('arrayAttrs', arrayAttrs);
				const node = await tmp_factory.addNode(XmlNode, {
					label: xmlTag,
					initialValues: xmlAttributes,
					xmlConfig: {
						noName: !hasNameAttribute,
						childTypes: complexType.childTypes.map((childType) => {
							const childName = childType.match(/^(.*)Type$/)?.at(1);
							if (!childName) return childType;
							return childName;
						}),
						xmlTag: xmlTag,
						outData: {
							name: xmlTag,
							type: `xmlElement:${xmlTag}`,
							socketLabel: xmlTag
						},

						xmlProperties: wu(complexType.attributes.values())
							.map((attr) => {
								return {
									name: attr.name,
									required: attr.required,
									// pattern: attr.pattern,
									type: attr.type,
									controlType: 'text'
								} as XmlAttributeDefinition;
							})
							.toArray()
					}
				});

				// Automatically select output of root types like Solvers, Mesh...
				if (rootTypes.includes(complexType.name.trim())) {
					console.log('good pizza', complexType.name, rootTypes);
					node.selectOutput('value');
				}

				if (hasNameAttribute) {
					const name = xmlAttributes['name'] as string;
					if (!nameToXmlNode.has(name)) {
						nameToXmlNode.set(name, node);
					}
				}
				for (const [k, a] of arrayAttrs.entries()) {
					const attrDef = complexType.attributes.get(k);
					if (!attrDef) throw new ErrorWNotif("Couldn't find simple type for array attribute");
					const initialValues: Record<string, unknown> = {};
					for (const [i, t] of a.entries()) {
						initialValues[`data-${i}`] = t;
					}
					const makeArrayNode = await tmp_factory.addNode(MakeArrayNode, {
						initialValues,
						numPins: a.length
					});

					// Gather array group name links
					if (attrDef.type === 'groupNameRef_array') {
						for (const [inputKey, t] of Object.entries(initialValues)) {
							if (typeof t !== 'string') {
								console.error(
									'Value of type groupNameRef should be of string type, type :',
									typeof t
								);
								continue;
							}
							groupNameLinks.push({
								source: t,
								target: {
									node: makeArrayNode,
									key: inputKey
								}
							});
						}
					}

					await tmp_editor.addNewConnection(makeArrayNode, 'array', node, k);
				}

				// Gather group name links
				for (const [k, v] of Object.entries(xmlAttributes)) {
					const attrDef = complexType.attributes.get(k);
					if (!attrDef) {
						console.warn('Attribute type not found', k, v);
						continue;
					}
					if (attrDef.type.startsWith('groupNameRef')) {
						const isArray = attrDef.type.endsWith('array');
						if (!isArray) {
							if (typeof v !== 'string') {
								console.error(
									'Value of type groupNameRef should be of string type, type :',
									typeof v
								);
								continue;
							}
							groupNameLinks.push({
								source: v,
								target: { node, key: k }
							});
						}
					}
				}

				if (parent) {
					console.log('node', node, 'parent', parent);
					const conn = await tmp_editor.addNewConnection(node, 'value', parent, 'children');
					console.log('temp conn', conn);
				}
				await xmlToEditor((xmlNode as Record<string, ParsedXmlNodes>)[xmlTag], schema, node);
			}
		}
		console.log('Download: full_xml', full_xml);
		await xmlToEditor(full_xml, geosSchema);
		// TODO: name connections

		const getNameNodes = new Map<string, GetNameNode>();
		for (const { source, target } of groupNameLinks) {
			const sourceNode = nameToXmlNode.get(source);
			if (!sourceNode) {
				console.warn('Source node not found', source);
				continue;
			}
			if (!getNameNodes.has(source)) {
				const getNameNode = await tmp_factory.addNode(GetNameNode, {});
				getNameNodes.set(source, getNameNode);
				await tmp_editor.addNewConnection(sourceNode, 'value', getNameNode, 'xml');
			}
			const getNameNode = getNameNodes.get(source)!;
			await tmp_editor.addNewConnection(getNameNode, 'name', target.node, target.key);
		}
		console.log(await arrange.layout());
		const area = factory.getArea();
		let leftBound = 0;
		if (area) {
			wu(area.nodeViews.values()).forEach((nodeView) => {
				leftBound = Math.min(leftBound, nodeView.position.x - nodeView.element.offsetWidth * 1.4);
			});
		}
		const nodesSaveData: NodeSaveData[] = [];
		for (const node of tmp_editor.getNodes()) {
			nodesSaveData.push(node.toJSON());
		}

		for (const [i, nodeSaveData] of nodesSaveData.entries()) {
			console.log(nodeSaveData);
			const node = await factory.loadNode(nodeSaveData);
			const tmp_nodeView = tmp_area.nodeViews.get(node.id) as NodeView;
			const nodeView = factory.getArea()?.nodeViews.get(node.id);
			factory.selectableNodes?.select(node.id, i !== 0);
			if (nodeView)
				await nodeView.translate(tmp_nodeView.position.x + leftBound, tmp_nodeView.position.y);
			await factory.getArea()?.update('node', node.id);
		}
		if (tmp_editor.getNodes().length > 0)
			notifications.show({
				title: get(_)('graph-editor.notification.title'),
				message: get(_)('code-editor-integration.push-to-graph.selected-node-dragging.message'),
				autoClose: 7000
			});

		for (const conn of tmp_editor.getConnections()) {
			await editor.addConnection(conn);
		}
		if (area) await AreaExtensions.zoomAt(area, editor.getNodes(), {});
	}
	async function download() {
		if (!codeEditorPromise) return;
		const codeEditor = await codeEditorPromise;
		const factory = editorContext.activeFactory;

		if (!factory) throw new ErrorWNotif('No active editor');
		const editor = factory.getEditor();
		let somethingToDownload = false;

		const selectedCode = codeEditor.getSelectedText();
		if (selectedCode) {
			somethingToDownload = true;
			const element = document.createElement('a');

			element.setAttribute(
				'href',
				'data:text/plain;charset=utf-8,' + encodeURIComponent(selectedCode)
			);
			element.setAttribute('download', 'geos.xml');

			element.style.display = 'none';
			document.body.appendChild(element);

			element.click();

			document.body.removeChild(element);
		}
		if (!factory?.selector) throw new ErrorWNotif('No selector');
		const promises = wu(factory.selector.entities.values())
			.map((selected) => editor.getNode(selected.id))
			.filter((node) => node instanceof XmlNode)
			.map(async (node) => {
				somethingToDownload = true;
				const xml = await (node as XmlNode).getXml();
				const element = document.createElement('a');

				element.setAttribute(
					'href',
					'data:text/plain;charset=utf-8,' + encodeURIComponent(formatXml({ xml }))
				);
				element.setAttribute('download', `${node.label}.xml`);

				element.style.display = 'none';
				document.body.appendChild(element);

				element.click();

				document.body.removeChild(element);
			});
		await Promise.all(promises);
		if (!somethingToDownload)
			notifications.show({
				autoClose: 6000,
				title: $_('code-editor-integration.button.download.notification.title'),
				color: 'orange',
				message: $_('code-editor-integration.button.download.notification.nothing-selected.message')
			});
	}

	class LivePreview {
		persistedActive = persisted('livePreview', false);
		#active = $state(get(this.persistedActive));
		model = $derived(codeEditor?.createModel({ language: 'geos_xml', value: '' }));
		xml = $state<string>();
		valid = $derived(this.xml !== undefined);

		get active() {
			return this.#active;
		}
		set active(b: boolean) {
			this.persistedActive.set(b);
			this.#active = b;

			this.updateLivePreview();
		}
		constructor() {
			$effect(() => {
				if (!codeEditor) return;
				untrack(() => {
					this.updateLivePreview();
				});
			});
			$effect(() => {
				untrack(() => {
					this.xml = undefined;
				});
				if (!this.active) return;
				if (!this.model) return;
				const factory = editorContext.activeFactory;
				if (!factory) {
					this.model.setValue('No active graph editor.');
					return;
				}
				if (factory.previewedNodes.size === 0) {
					this.model.setValue(
						'Please mark at least one GEOS node for live\npreview.\nYou can do so with a right click on a node.'
					);
					return;
				}
				const previewedNode = factory.previewedNodes.values().next().value as Node;
				const data = factory.dataflowCache.get(previewedNode);
				if (!data) {
					this.model.setValue('Missing data for previewed node.');
					return;
				}
				const xmlData = Object.entries(data).filter(([k, v]) => v instanceof XMLData) as [
					string,
					XMLData
				][];
				if (xmlData.length === 0) {
					this.model.setValue('No GEOS or XML data found for previewed node.');
					return;
				}
				const res: string[] = [];
				// res.push('<!-- ')
				for (const [k, v] of xmlData) {
					if (xmlData.length > 1) res.push(`<!-- ${previewedNode.outputs[k].label} -->`);
					res.push(v.toXml());
				}
				untrack(() => {
					this.xml = formatXml({ xml: res.join('\n') });
					if (this.xml && this.model)
						this.model.setValue(
							`<!-- Live preview: ${previewedNode.name ?? previewedNode.label} -->\n` + this.xml
						);
				});
			});
		}

		updateLivePreview() {
			if (!codeEditor) return;
			codeEditor.activeModel = this.active ? this.model : codeEditorCmpnt?.getModel();
			codeEditor.readonly = this.active;
		}
	}
	const livePreview = new LivePreview();
</script>

{#await codeEditorPromise then}
	{#if !livePreview.active}
		<div
			transition:fade={{ duration: 200 }}
			class="absolute bottom-0 top-0 -translate-x-1/2 z-[5] nope-pt-[2.64rem] pointer-events-none overflow-clip"
		>
			<div class="h-full flex flex-col gap-2 justify-center pointer-events-none">
				<CodeEditorIntegrationButton icon={faArrowRight} flip={'horizontal'} on:click={push} />
				<CodeEditorIntegrationButton icon={faArrowRight} on:click={toCodeEditor} />
				<CodeEditorIntegrationButton icon={faArrowDown} on:click={download} />
			</div>
		</div>
	{/if}
{/await}
<section
	transition:slide={{ axis: 'x', duration: 200 }}
	class="relative grid grid-rows-[0fr,1fr] h-full w-[40vw] overflow-clip border-s-2 border-base-300 dborder-base-content dborder-opacity-20"
>
	<CodeEditorComponent
		bind:this={codeEditorCmpnt}
		width="w-[40vw]"
		downloadAvailable={!livePreview.active || livePreview.valid}
		textToDownload={livePreview.xml}
	>
		{#snippet additionalButtons()}
			<label class="label cursor-pointer gap-2 justify-self-end pe-2"
			use:shortcut={{ shortcuts: [{key: 'l', ctrl: true}], ignoreElements: [], action(node, e) {
				if (contextMenu.visible) return;
				livePreview.active = !livePreview.active;
			},}}

			title={"Toggle the live preview. When active, the code editor is read-only and the live preview is shown.\n(Ctrl+L)"}
			>
				<input
					type="checkbox"
					class="toggle toggle-sm transition-all enabled:toggle-accent"
					disabled={!codeEditor}
					bind:checked={livePreview.active}
				/>
				<span class="label-text text-nowrap">Live preview</span>
			</label>
		{/snippet}
	</CodeEditorComponent>
	<h1
		class="select-none opacity-50 font-bold text-xl text-right text-nowrap truncate pe-4 pb-2"
		title="Code Editor"
	>
		Code Editor
	</h1>
</section>
