import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { ICodeEditor } from '../../CodeEditor.svelte';
// import formatXml from 'xml-formatter';
import { conf, getGeosXmlCompletionItemProvider, language } from './geos_xml';
import loader from '@monaco-editor/loader';
import * as monaco from 'monaco-editor';
import { formatXml, XmlSchema } from '@selenite/commons';
import { ErrorWNotif } from '@selenite/graph-editor';
import './monaco';
import { KeyCode, KeyMod } from 'monaco-editor/esm/vs/editor/editor.api';
export default class MonacoCodeEditor implements ICodeEditor {
	private monaco: typeof Monaco;
	private editor?: Monaco.editor.IStandaloneCodeEditor;
	private geosSchema: XmlSchema;
	models: Monaco.editor.ITextModel[] = [];

	private constructor(params: { monaco: typeof Monaco; geosSchema: XmlSchema }) {
		const { geosSchema } = params;
		this.geosSchema = params.geosSchema;
		this.monaco = params.monaco;
		// Register XML configuration
		const geos_xml = this.monaco.languages.getLanguages().find((v) => v.id == 'geos_xml');
		if (geos_xml) return;
		this.monaco.languages.register({ id: 'geos_xml', extensions: ['.xml'] });
		this.monaco.languages.setLanguageConfiguration('geos_xml', conf);
		this.monaco.languages.setMonarchTokensProvider('geos_xml', language);
		this.monaco.languages.registerHoverProvider('geos_xml', {
			provideHover(model, position, token) {
				const hoveredWord = model.getWordAtPosition(position);
				if (!hoveredWord) return null;
				console.debug('hoveredWord', hoveredWord);
				// The following regex first discriminates <? to avoid tagging <?xml as a tag
				const tagMatch = model.findPreviousMatch(
					'(?:<\\?|>|<(\\w+)[\\s\\r\\n]+|</?\\s*(\\w+))',
					position,
					true,
					false,
					null,
					true
				);
				const isWithinTag = tagMatch !== null && tagMatch.matches?.at(1) !== undefined;
				const isTag = tagMatch !== null && tagMatch.matches?.at(2) !== undefined;
				console.debug('isTag', isTag, 'isWithinTag', isWithinTag);

				if (isTag) {
					const tag = hoveredWord.word;
					const complexType = geosSchema.typeMap.get(tag);
					if (complexType) {
						const baseUrl =
							'https://geosx-geosx.readthedocs-hosted.com/en/latest/docs/sphinx/CompleteXMLSchema.html';
						const link = `${baseUrl}#element-${tag.toLowerCase()}`;
						return {
							contents: [
								{
									supportHtml: true,
									value: `<b><a href="${link ?? 'missing link'}"> ${tag}</a></b><br/><ul><li>${(
										complexType.childTypes ?? []
									).join('</li><li>')}</li></ul>
						`
								}
							]
						};
					} else {
						console.error(`${tag} not found`);
					}
				}
				if (isWithinTag) {
					const attributeMatch = model.findPreviousMatch(
						'(?:\\w[\\s\\r\\n]*|(=))',
						{ column: hoveredWord.startColumn, lineNumber: position.lineNumber },
						true,
						false,
						null,
						true
					);
					console.debug(
						'attributeMatch',
						attributeMatch?.matches,
						attributeMatch?.matches?.at(1) === undefined
					);
					const isAttr =
						attributeMatch !== null &&
						attributeMatch.matches?.at(1) === undefined &&
						attributeMatch.matches?.at(0) !== '=';

					if (isAttr) {
						const tag = tagMatch.matches?.at(1);
						if (tag) {
							const complexType = geosSchema.complexTypes.get(tag);
							if (complexType) {
								const attr = complexType.attributes.get(hoveredWord.word);
								if (attr) {
									const requiredOrDefault = attr.required ? '<small> required</small>' : '';

									return {
										contents: [
											{
												supportHtml: true,
												value: `<b>${attr.name} </b><i> ${attr.type}</i><br/>${requiredOrDefault}<br/>${attr.doc?.replaceAll(':ref:', '')}`
											}
										]
									};
								}
							}
						}
					}
				}
				return { contents: [] };
			}
		});
		this.monaco.languages.registerCompletionItemProvider(
			'geos_xml',
			getGeosXmlCompletionItemProvider({ geosSchema, monaco: this.monaco })
		);
		this.monaco.languages.registerDocumentFormattingEditProvider('geos_xml', {
			provideDocumentFormattingEdits: (model, options, token) => {
				const xml = model.getValue();
				const formatted = formatXml({ xml });
				return [
					{
						range: model.getFullModelRange(),
						text: formatted
					}
				];
			}
		});
	}
	getSelectedText(): string {
		if (!this.editor) throw new ErrorWNotif('Editor not created');
		const editor = this.editor;
		const selections = this.editor.getSelections();
		if (selections === null) return '';
		return selections
			.map((selection) => editor.getModel()?.getValueInRange(selection) ?? '')
			.join('\n');
	}
	setText(params: { text: string; cursorOffset?: number | null; history?: boolean }): void {
		if (params.cursorOffset === undefined) params.cursorOffset = null;
		if (!this.activeModel) throw new ErrorWNotif('Model not created');
		if (params.history ?? true) {
			this.editor?.executeEdits('', [
				{
					range: this.activeModel.getFullModelRange(),
					text: params.text
				}
			]);
			this.editor?.pushUndoStop();
		} else {
			this.activeModel.setValue(params.text);
		}
		// this.model.setValue(params.text);
		// if (params.cursorOffset !== null) {
		// 	const position = this.model.getPositionAt(params.cursorOffset);
		// 	this.editor?.setPosition(position);
		// }
	}

	setLightTheme(light: boolean): void {
		this.monaco.editor.setTheme(light ? 'vs' : 'vs-dark');
	}

	public setup_(params: { container: HTMLElement; model?: Monaco.editor.ITextModel }): void {
		// Your monaco instance is ready, let's display some code!
		this.editor = this.monaco.editor.create(params.container, {
			fixedOverflowWidgets: true,
			automaticLayout: true,
			dragAndDrop: true,
			dropIntoEditor: { enabled: true },
			model: params.model
		});
		this.editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyL, () => {
			document.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'l', ctrlKey: true, code: 'KeyL' })
			);
		});
	}

	public destroy() {
		this.editor?.dispose();
		// this.models.forEach(model => model.dispose());
		// this.models = [];
	}

	public static async create({ geosSchema }: { geosSchema: XmlSchema }) {
		loader.config({ monaco });
		const monacoInstance = await loader.init();
		// const monaco = (await import('./monaco')).default;
		return new MonacoCodeEditor({ monaco: monacoInstance, geosSchema });
	}
	public createModel(params: { value?: string; language?: string }): Monaco.editor.ITextModel {
		const model = this.monaco.editor.createModel(params.value ?? '', params.language);
		this.models.push(model);
		return model;
	}

	#readonly: boolean = $state(false);
	get readonly() {
		return this.#readonly;
	}

	set readonly(r: boolean) {
		this.editor?.updateOptions({ readOnly: r });
		this.#readonly = r;
	}

	get activeModel() {
		return this.editor?.getModel() ?? undefined;
	}
	set activeModel(model: Monaco.editor.ITextModel | undefined) {
		this.editor?.setModel(model ?? null);
	}

	public getText() {
		if (!this.activeModel) {
			console.error('Model not created');
			return undefined;
		}
		const text = this.activeModel.getValue();
		if (!this.editor) {
			console.error('Editor not created');
			return undefined;
		}
		const res: ReturnType<ICodeEditor['getText']> = { text, cursorOffset: null };
		const position = this.editor.getPosition();
		if (!position) {
			console.error('Position not found');
			return res;
		}
		res.cursorOffset = this.activeModel.getOffsetAt(position);
		return res;
	}
}
