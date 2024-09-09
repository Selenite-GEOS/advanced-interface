<script lang="ts">
	import { CodeEditorComponent } from '$lib/code-editor';
	import {
		ErrorWNotif,
		notifications,
		XMLData,
		XmlNode
	} from '@selenite/graph-editor';
	// import { ErrorWNotif, getContext, _ } from '$lib/global';
	import 'regenerator-runtime/runtime';
	import wu from 'wu';
	import { _, persisted } from '$lib/global';
	import { formatXml, shortcut, resizable, animationFrame, sleep, contextMenu } from '@selenite/commons';
	import { type Node } from '@selenite/graph-editor';
	import { tick, untrack } from 'svelte';

	import { get } from 'svelte/store';
	import { getContext } from '$lib/global';
	import CodeEditorIntegrationButton from './CodeEditorIntegrationButton.svelte';
	import { faArrowDown, faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import { fade, slide } from 'svelte/transition';
	import type { Model } from '$lib/code-editor/CodeEditor.svelte';
	// import type { XmlAttributeDefinition } from "@sel";
	const editorContext = getContext('editor');
	const geosContext = getContext('geos');

	const geosSchema = $derived(geosContext.schema);
	let codeEditorCmpnt = $state<CodeEditorComponent>();
	const codeEditorPromise = $derived(codeEditorCmpnt?.getCodeEditorContext().codeEditorPromise);
	const codeEditor = $derived(codeEditorCmpnt?.getCodeEditorContext().codeEditor);

	/**
	 * Pulls the selected nodes from the graph editor to the code editor
	 */
	async function toCodeEditor() {
		if (!codeEditorPromise) return;
		const codeEditor = await codeEditorPromise;
		const factory = editorContext.activeFactory;
		if (!factory) throw new ErrorWNotif('No active editor');
		if (!geosSchema) throw new ErrorWNotif('No geos schema');

		const text = codeEditor.getText();
		if (!text) return;
		const res = await factory.codeIntegration.toCode({ schema: geosSchema, text: text.text });
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
		const text = selectedText.length > 0 ? selectedText : codeEditor.getText()?.text;
		if (!text || text.trim().length === 0) return;
		await factory.codeIntegration.toGraph({
			text,
			schema: geosSchema
		});
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
			reloadModel = codeEditor.activeModel;
			codeEditor.readonly = this.active;
		}
	}
	let reloadModel = $state<Model>();
	const livePreview = new LivePreview();
	let visible = $state(true);
	let width = persisted<number | undefined>('code-integration-width', undefined);

	// Reload code editor when exiting full screen to avoid a bug where it keeps the size of full screen
	$effect(() => {
		document.addEventListener('fullscreenchange', async () => {
			if (document.fullscreenElement) return;
			visible = false;
			await tick();
			await animationFrame();
			await sleep(500);
			visible = true;
		});
	});
</script>

{#await codeEditorPromise then}
	{#if !livePreview.active}
		<div
			transition:fade={{ duration: 200 }}
			class="absolute bottom-0 top-0 -translate-x-1/2 z-[5] nope-pt-[2.64rem] pointer-events-none overflow-clip"
		>
			<div class="h-full flex flex-col gap-2 justify-center pointer-events-none">
				<CodeEditorIntegrationButton icon={faArrowRight} flip={'horizontal'} onclick={toGraph} />
				<CodeEditorIntegrationButton icon={faArrowRight} onclick={toCodeEditor} />
				<CodeEditorIntegrationButton icon={faArrowDown} onclick={download} />
			</div>
		</div>
	{/if}
{/await}
<section
	transition:slide={{ axis: 'x', duration: 200 }}
	class="relative grid h-full overflow-clip border-s-2 border-base-300 dborder-base-content dborder-opacity-20"
>
	<div
		class="w-[40vw] grid grid-rows-[0fr,1fr,0fr]"
		style="width: {$width}px;"
		use:resizable={{ sides: { left: true }, onresize: ({ width: w }) => ($width = w) }}
	>
		<CodeEditorComponent
			bind:this={codeEditorCmpnt}
			{visible}
			width={$width}
			downloadAvailable={!livePreview.active || livePreview.valid}
			textToDownload={livePreview.xml}
			{reloadModel}
		>
			{#snippet additionalButtons()}
				<label
					class="label cursor-pointer gap-2 justify-self-end pe-2"
					use:shortcut={{
						shortcuts: [{ key: 'l', ctrl: true }],
						ignoreElements: [],
						action(node, e) {
							if (contextMenu.visible) return;
							livePreview.active = !livePreview.active;
						}
					}}
					title={'Toggle the live preview. When active, the code editor is read-only and the live preview is shown.\n(Ctrl+L)'}
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
		<div class="monaco-editor !outline-none">
			<h1
				class="bottom-0 right-0 absolute z-10 select-none opacity-50 font-bold text-xl text-right text-nowrap truncate pe-8 py-2 text-base-content"
				title="Code Editor"
			>
				Code Editor
			</h1>
		</div>
	</div>
</section>
