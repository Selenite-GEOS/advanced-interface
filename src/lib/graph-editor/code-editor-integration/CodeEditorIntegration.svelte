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
	async function toGraph() {
		if (!geosSchema) throw new ErrorWNotif('No geos schema');
		if (!codeEditor) return;
		const factory = editorContext.activeFactory;
		if (!factory) throw new ErrorWNotif('No active editor');
		
		const selectedText = codeEditor.getSelectedText();
		await factory.codeIntegration.toGraph({text: selectedText.length > 0 ? selectedText : codeEditor.getText().text, schema: geosSchema})	
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
				<CodeEditorIntegrationButton icon={faArrowRight} flip={'horizontal'} on:click={toGraph} />
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
