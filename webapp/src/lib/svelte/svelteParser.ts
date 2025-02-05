import type { Node, Comment } from 'estree';
import * as estypes from 'estree';
import { parse as svelteParser } from 'svelte/compiler';

export interface ComponentDoc {
	name: string;
	description: string;
	props: PropDoc[];
	events: EventDoc[];
	slots: SlotDoc[];
	exports: string[];
}

interface PropDoc {
	name: string;
	type: string;
	defaultValue?: string;
	description: string;
	required: boolean;
}

interface EventDoc {
	name: string;
	detail: string;
	description: string;
}

interface SlotDoc {
	name: string;
	props: string[];
	description: string;
}

interface SvelteAST {
	html: Node;
	instance?: {
		content: {
			body: Node[];
		};
		comments?: Comment[];
	};
	module?: {
		comments?: Comment[];
	};
}

export class SvelteParser {
	async parseComponent(source: string, filename: string): Promise<ComponentDoc> {
		const parsedAst = svelteParser(source, {
			filename,
			modern: false
		});

		const ast: SvelteAST = {
			html: parsedAst.html,
			instance: parsedAst.instance,
			module: parsedAst.module
		};

		const componentDoc: ComponentDoc = {
			name: this.extractComponentName(filename),
			description: this.extractDescription(ast),
			props: [],
			events: [],
			slots: [],
			exports: []
		};

		if (ast.instance) {
			this.parseScript(ast.instance, componentDoc);
		}

		if (ast.html) {
			this.parseTemplate(ast.html, componentDoc);
		}

		return componentDoc;
	}

	private extractComponentName(filename: string): string {
		return filename.split('/').pop()?.replace('.svelte', '') || '';
	}

	private extractDescription(ast: SvelteAST): string {
		const comments = ast.module?.comments || [];
		return comments
			.filter((comment) => comment.type === 'Block' && /^\*/.test(comment.value))
			.map((comment) => comment.value.replace(/^\*|\*/g, '').trim())
			.join('\n');
	}

	private parseScript(script: NonNullable<SvelteAST['instance']>, doc: ComponentDoc) {
		script.content.body.forEach((node: Node) => {
			if (node.type === 'ExportNamedDeclaration' && node.declaration) {
				if (node.declaration.type === 'VariableDeclaration') {
					node.declaration.declarations.forEach((decl) => {
						if (decl.type === 'VariableDeclarator' && decl.id.type === 'Identifier') {
							const prop: PropDoc = {
								name: decl.id.name,
								type: this.inferType(decl.init),
								defaultValue: decl.init ? this.extractValue(decl.init) : undefined,
								description: this.extractNodeDescription(node),
								required: !decl.init
							};
							doc.props.push(prop);
						}
					});
				}
			}

			if (node.type === 'VariableDeclaration') {
				node.declarations.forEach((decl) => {
					if (
						decl.type === 'VariableDeclarator' &&
						decl.init?.type === 'CallExpression' &&
						decl.init.callee.type === 'Identifier' &&
						decl.init.callee.name === 'createEventDispatcher'
					) {
						this.findEventDispatches(script, doc);
					}
				});
			}
		});
	}

	private parseTemplate(template: Node, doc: ComponentDoc) {
		const walkTemplate = (node: any) => {
			if (node.type === 'Slot') {
				const slot: SlotDoc = {
					name: node.name || 'default',
					props: node.attributes.map((attr: any) => attr.name),
					description: ''
				};
				doc.slots.push(slot);
			}

			if (node.type === 'Element') {
				node.attributes.forEach((attr: any) => {
					if (attr.type === 'EventHandler') {
						const event: EventDoc = {
							name: attr.name,
							detail: this.inferEventDetail(attr.expression),
							description: ''
						};
						if (!doc.events.some((e) => e.name === event.name)) {
							doc.events.push(event);
						}
					}
				});
			}

			if (node.children) {
				node.children.forEach(walkTemplate);
			}
		};

		walkTemplate(template);
	}

	private inferType(node: estypes.Expression | null | undefined): string {
		if (!node) return 'any';
		switch (node.type) {
			case 'Literal':
				return typeof node.value;
			case 'ArrayExpression':
				return 'array';
			case 'ObjectExpression':
				return 'object';
			default:
				return 'any';
		}
	}

	private extractValue(node: estypes.Expression): string | undefined {
		switch (node.type) {
			case 'Literal':
				return String(node.value);
			case 'ArrayExpression':
				return '[]';
			case 'ObjectExpression':
				return '{}';
			default:
				return undefined;
		}
	}

	private extractNodeDescription(node: Node & { leadingComments?: Comment[] }): string {
		const comments = node.leadingComments || [];
		return comments
			.filter((comment) => comment.type === 'Block' && /^\*/.test(comment.value))
			.map((comment) => comment.value.replace(/^\*|\*/g, '').trim())
			.join('\n');
	}

	private findEventDispatches(script: NonNullable<SvelteAST['instance']>, doc: ComponentDoc) {
		const walkNode = (node: any) => {
			if (
				node.type === 'CallExpression' &&
				node.callee.type === 'Identifier' &&
				node.callee.name === 'dispatch'
			) {
				const eventName = node.arguments[0]?.value;
				const eventDetail = node.arguments[1] ? this.inferType(node.arguments[1]) : undefined;

				if (eventName && !doc.events.some((e) => e.name === eventName)) {
					doc.events.push({
						name: eventName,
						detail: eventDetail || 'void',
						description: ''
					});
				}
			}

			for (const key in node) {
				if (node[key] && typeof node[key] === 'object') {
					walkNode(node[key]);
				}
			}
		};

		walkNode(script);
	}

	private inferEventDetail(expression: Node | null): string {
		if (!expression) return 'void';
		return 'any';
	}
}
