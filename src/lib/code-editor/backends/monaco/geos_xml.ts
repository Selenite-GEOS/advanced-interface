/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { XmlSchema } from '@selenite/commons';
import { ErrorWNotif } from '@selenite/graph-editor';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import type { languages, editor, Position } from 'monaco-editor/esm/vs/editor/editor.api';
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'regenerator-runtime/runtime';
import wu from 'wu';
enum IndentAction {
	None = 0,
	Indent = 1,
	IndentOutdent = 2,
	Outdent = 3
}

export const conf: languages.LanguageConfiguration = {
	comments: {
		blockComment: ['<!--', '-->']
	},
	// folding: {
	// 	markers: {
	// 		start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
	// 		end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->")
	// 	}
	// },
	brackets: [['<', '>']],
	autoClosingPairs: [
		{ open: '<', close: '>' },
		{ open: "'", close: "'" },
		{ open: '"', close: '"' }
	],
	surroundingPairs: [
		{ open: '<', close: '>' },
		{ open: "'", close: "'" },
		{ open: '"', close: '"' }
	],
	onEnterRules: [
		{
			beforeText: new RegExp(`<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
			afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
			action: {
				indentAction: IndentAction.IndentOutdent
			}
		},
		{
			beforeText: new RegExp(/<\w+\s*[^>.\n]*?$/, 'i'),
			// afterText: /.*?>/,
			action: { indentAction: IndentAction.Indent }
		},
		{
			beforeText: new RegExp(`<(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
			action: { indentAction: IndentAction.Indent }
		},
		{
			beforeText: new RegExp(/^\s*[^<]*?[^<\s]+\s*?\/>.*?$/, 'i'),
			action: { indentAction: IndentAction.Outdent }
		}
	]
};

export const language = <languages.IMonarchLanguage>{
	defaultToken: '',
	tokenPostfix: '.xml',

	ignoreCase: true,

	// Useful regular expressions
	qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,

	tokenizer: {
		root: [
			[/[^<&]+/, ''],

			{ include: '@whitespace' },

			// Standard opening tag
			[/(<)(@qualifiedName)/, [{ token: 'delimiter' }, { token: 'tag', next: '@tag' }]],

			// Standard closing tag
			[
				/(<\/)(@qualifiedName)(\s*)(>)/,
				[{ token: 'delimiter' }, { token: 'tag' }, '', { token: 'delimiter' }]
			],

			// Meta tags - instruction
			[/(<\?)(@qualifiedName)/, [{ token: 'delimiter' }, { token: 'metatag', next: '@tag' }]],

			// Meta tags - declaration
			[/(<\!)(@qualifiedName)/, [{ token: 'delimiter' }, { token: 'metatag', next: '@tag' }]],

			// CDATA
			[/<\!\[CDATA\[/, { token: 'delimiter.cdata', next: '@cdata' }],

			[/&\w+;/, 'string.escape']
		],

		cdata: [
			[/[^\]]+/, ''],
			[/\]\]>/, { token: 'delimiter.cdata', next: '@pop' }],
			[/\]/, '']
		],

		tag: [
			[/[ \t\r\n]+/, ''],
			[/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ['attribute.name', '', 'attribute.value']],
			[
				/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/,
				['attribute.name', '', 'attribute.value']
			],
			[/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ['attribute.name', '', 'attribute.value']],
			[/@qualifiedName/, 'attribute.name'],
			[/\?>/, { token: 'delimiter', next: '@pop' }],
			[/(\/)(>)/, [{ token: 'tag' }, { token: 'delimiter', next: '@pop' }]],
			[/>/, { token: 'delimiter', next: '@pop' }]
		],

		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/<!--/, { token: 'comment', next: '@comment' }]
		],

		comment: [
			[/[^<\-]+/, 'comment.content'],
			[/--!?>/, { token: 'comment', next: '@pop' }],
			[/<!--/, 'comment.content.invalid'],
			[/[<\-]/, 'comment.content']
		]
	}
};

const s = '[\\r\\s\\n]*';
/**
 * Returns the xml tag enclosing a position. Undefined if not found
 */
export function extractXMLNode({
	model,
	position
}: {
	model: editor.ITextModel;
	position: Position;
}): string | undefined {
	const before = model.findPreviousMatch('<[\\r\\s\\n]*(\\w+)', position, true, false, null, true);
	const tag = before?.matches?.at(1);
	console.log(tag);
	if (!before || !tag) return undefined;
	let after = model.findNextMatch(`</${tag}>`, position, true, false, null, true);
	if (!after) {
		after = model.findNextMatch('/>', position, true, false, null, true);
	}
	if (!after) return undefined;

	console.log(after.matches);
	return model.getValueInRange({
		startColumn: before.range.startColumn,
		startLineNumber: before.range.startLineNumber,
		endColumn: after.range.endColumn,
		endLineNumber: after.range.endLineNumber
	});
}

export function getXmlParser(): XMLParser {
	return new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '',
		preserveOrder: false,
		attributesGroupName: '@a'
	});
}

export function parseXMLNode({
	model,
	position
}: {
	model: editor.ITextModel;
	position: Position;
}): { [key: string]: { '@a': Record<string, unknown> } } | undefined {
	const node = extractXMLNode({ model, position });
	if (!node) return undefined;
	const res = getXmlParser().parse(node);
	return res;
}

/**
 * Finds the xml attributes located around the given position. The position must be within a tag
 * @param param {model, position} model: the model to search in, position: the position to search around
 * @returns the attributes found before and after the given position
 */
export function getAttrsAround({
	model,
	position
}: {
	model: editor.ITextModel;
	position: Position;
}): string[] {
	const res: string[] = [];
	const node = parseXMLNode({ model, position });
	console.log('attrs around', node);
	if (!node) return res;

	const keys = Object.keys(node);
	if (keys.length !== 1) throw new ErrorWNotif({ emessage: 'Wrong numbers of keys' });
	const key = keys[0];
	if (typeof node[key] === 'string' || !('@a' in node[key])) return [];
	return Object.keys(node[key]['@a']);
}

export function getGeosModelContext({
	model,
	position,
	word
}: {
	model: editor.ITextModel;
	position: Position;
	word?: string | undefined;
}): { tag: string | undefined; attributes: string[] } {
	const res: { tag: string | undefined; attributes: string[] } = { tag: undefined, attributes: [] };
	const tagMatch = model.findPreviousMatch(
		'(?:<\\?|>|<(\\w+)[\\s\\r\\n]+|</?\\s*(\\w+))',
		position,
		true,
		false,
		null,
		true
	);
	const isWithinTag = tagMatch !== null && tagMatch.matches?.at(1) !== undefined;
	const isTag = tagMatch?.matches?.at(2) !== undefined;

	if (isWithinTag) {
		res.tag = tagMatch.matches?.at(1);
		res.attributes = getAttrsAround({ model, position });
	}
	return res;
}
/**
 * V2 of context using parsing and bfs search
 */
function getModelGeosContext({
	model,
	position
}: {
	model: editor.ITextModel;
	position: Position;
}) {
	const fullModel = model.getValue();
	const queryTag = 'cursorPositionQueryyy';
	const offset = model.getOffsetAt(position);
	const queryXml = fullModel.slice(0, offset) + `<${queryTag}/>` + fullModel.slice(offset);

	const parsed = new XMLParser().parse(queryXml);

	const toVisit: { xml: Record<string, unknown>; payload: { parents: string[] } }[] = [];
	let i = 0;
	// init toVisit queue
	toVisit.push({ xml: parsed, payload: { parents: [] } });
	while (i < toVisit.length) {
		const item = toVisit[i];
		for (const key in item.xml) {
			if (key === queryTag) {
				return item.payload;
			}
			const xml = item.xml[key];
			const { parents } = item.payload;
			if (xml && typeof xml === 'object')
				toVisit.push({
					xml: xml as Record<string, unknown>,
					payload: { parents: [...parents, key] }
				});
		}
		i++;
	}
}

export function getGeosXmlCompletionItemProvider({
	geosSchema,
	monaco
}: {
	geosSchema: XmlSchema;
	monaco: typeof Monaco;
}): languages.CompletionItemProvider {
	return {
		provideCompletionItems(model, position, context, token) {
			const res: languages.ProviderResult<languages.CompletionList> = {
				incomplete: false,
				suggestions: []
			};
			const startQuoteMatch = model.findPreviousMatch(
				'=\\s*"[^"]*',
				position,
				true,
				false,
				null,
				true
			);
			console.log('start quote', startQuoteMatch);
			if (startQuoteMatch?.range.containsPosition(position)) {
				return res;
			}
			const wordMatch = model.findPreviousMatch(
				'(?:\\s|(\\w+))',
				position,
				true,
				false,
				null,
				true
			);
			const word = wordMatch?.matches?.at(1);

			const after = model.getValueInRange({
				startColumn: position.column,
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				endColumn: model.getLineMaxColumn(position.lineNumber)
			});

			const geosContext = getGeosModelContext({ model, position });
			if (geosContext.tag === undefined) {
				// We are not within a tag but maybe within a node
				const beforeMatch = model.findPreviousMatch('[^<]|(<)', position, true, false, null, true);
				const beforeBracket = beforeMatch?.matches?.at(1);

				const context = getModelGeosContext({
					model,
					position: beforeMatch ? beforeMatch.range.getStartPosition() : position
				});

				const parentNode = context?.parents.at(-1);
				if (!parentNode) return res;

				const parentElement = geosSchema.complexTypes.get(parentNode);
				if (!parentElement) return res;

				// Parent element found
				// Look if there are < or > to overwrite

				const afterMatch = model.findNextMatch('<|(>)', position, true, false, null, true);
				const afterBracket = afterMatch?.matches?.at(1);
				console.log('beforeBracket', beforeBracket, 'afterBracket', afterBracket);

				console.log(parentElement);
				parentElement.childTypes.forEach((childType) => {
					const element = geosSchema.complexTypes.get(childType);
					if (!element) return;

					// prepare insert text
					// insert text includes required attributes
					// with name first
					const requiredAttrs = wu(element.attributes.keys())
						.filter((k) => element.attributes.get(k)?.required ?? false)
						.toArray();

					const hasName = requiredAttrs.find((a) => a == 'name') !== undefined;
					const notNameAttrs = !hasName ? requiredAttrs : requiredAttrs.filter((a) => a !== 'name');
					const preppedAttrs = wu([...(hasName ? ['name'] : []), ...notNameAttrs])
						.map((a) => ` ${a}="${element.attributes.get(a)?.type ?? 'required'}"`)
						.toArray()
						.join('\n');
					console.log('preppedAttrs', preppedAttrs);

					const insertText =
						preppedAttrs.length === 0 && element.childTypes.length > 0
							? `<${childType}>\n\t\n</${childType}>`
							: `<${childType}${notNameAttrs.length > 0 || hasName ? `\n${preppedAttrs}\n` : ''}/>`;
					const startColumn = beforeBracket
						? (beforeMatch as editor.FindMatch).range.startColumn
						: position.column;
					const endColumn = afterBracket
						? (afterMatch as editor.FindMatch).range.endColumn
						: position.column;
					console.log('startColumn', startColumn);

					res.suggestions.push({
						label: childType,
						insertText,
						filterText: `<${childType}`,
						kind: monaco.languages.CompletionItemKind.Class,
						detail: parentNode,
						// insertTextRules: languages.CompletionItemInsertTextRule.KeepWhitespace,
						documentation: {
							supportHtml: true,
							value: `<a href="${element.link}">${element.name}</a>`
						},
						range: {
							startColumn,
							endColumn,
							endLineNumber: position.lineNumber,
							startLineNumber: position.lineNumber
						}
					});
				});

				return res;
			}
			const complexType = geosSchema.complexTypes.get(geosContext.tag);
			if (!complexType) return res;
			const allAttributes = complexType.attributes;
			const remainingAttrs: typeof allAttributes = new Map();
			allAttributes.forEach((attr, name) => {
				if (!geosContext.attributes.includes(name)) remainingAttrs.set(name, attr);
			});
			const startColumn = word ? (wordMatch?.range.startColumn as number) : position.column;
			remainingAttrs.forEach((attr, name) => {
				const insertText = `${name}="${attr.default ?? ''}"`;
				res.suggestions.push({
					label: name + (attr.required ? '*' : ''),
					kind: monaco.languages.CompletionItemKind.Field,
					range: {
						startLineNumber: position.lineNumber,
						endLineNumber: position.lineNumber,
						startColumn: startColumn,
						endColumn: position.column
					},
					insertText: insertText,
					sortText: (attr.required ? '0' : '1') + name,
					detail: attr.type,
					preselect: false,
					documentation: { value: `${attr.description}`, supportHtml: true }
				});
			});

			// if (res.suggestions.length > 0) {
			// 	res.suggestions[0].preselect = true;
			// }
			console.log(res);
			return res;
		}
		// resolveCompletionItem(item, token) {
		// 	return item;

		// },
		// triggerCharacters: undefined
	};
}
