import { parse } from 'svelte/compiler';
import type { AST } from 'svelte/compiler';

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

export class SvelteParser {
  async parseComponent(source: string, filename: string): Promise<ComponentDoc> {
    const ast: AST = parse(source);
    
    const componentDoc: ComponentDoc = {
      name: this.extractComponentName(filename),
      description: this.extractDescription(ast),
      props: [],
      events: [],
      slots: [],
      exports: []
    };

    if (ast.instance) {
      // Parse <script> section
      this.parseScript(ast.instance, componentDoc);
    }

    if (ast.html) {
      // Parse template section
      this.parseTemplate(ast.html, componentDoc);
    }

    return componentDoc;
  }

  private extractComponentName(filename: string): string {
    return filename.split('/').pop()?.replace('.svelte', '') || '';
  }

  private extractDescription(ast: AST): string {
    const comments = ast.module?.comments || [];
    const moduleDoc = comments
      .filter(comment => comment.type === 'Block' && /^\*/.test(comment.value))
      .map(comment => comment.value.replace(/^\*|\*/g, '').trim())
      .join('\n');
    return moduleDoc;
  }

  private parseScript(script: any, doc: ComponentDoc) {
    script.content.body.forEach((node: any) => {
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration?.type === 'VariableDeclaration') {
          // Export let declarations (props)
          node.declaration.declarations.forEach((decl: any) => {
            const prop: PropDoc = {
              name: decl.id.name,
              type: this.inferType(decl.init),
              defaultValue: decl.init ? this.extractValue(decl.init) : undefined,
              description: this.extractNodeDescription(node),
              required: !decl.init
            };
            doc.props.push(prop);
          });
        }
      }
      
      // Look for createEventDispatcher usage
      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach((decl: any) => {
          if (decl.init?.type === 'CallExpression' && 
              decl.init.callee.name === 'createEventDispatcher') {
            this.findEventDispatches(script, doc);
          }
        });
      }
    });
  }

  private parseTemplate(template: any, doc: ComponentDoc) {
    const walkTemplate = (node: any) => {
      // Find slots
      if (node.type === 'Slot') {
        const slot: SlotDoc = {
          name: node.name || 'default',
          props: node.attributes.map((attr: any) => attr.name),
          description: ''
        };
        doc.slots.push(slot);
      }

      // Find event handlers
      if (node.type === 'Element') {
        node.attributes.forEach((attr: any) => {
          if (attr.type === 'EventHandler') {
            const event = {
              name: attr.name,
              detail: this.inferEventDetail(attr.expression),
              description: ''
            };
            if (!doc.events.some(e => e.name === event.name)) {
              doc.events.push(event);
            }
          }
        });
      }

      // Recursive walk
      if (node.children) {
        node.children.forEach(walkTemplate);
      }
    };

    walkTemplate(template);
  }

  private inferType(node: any): string {
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

  private extractValue(node: any): string | undefined {
    if (!node) return undefined;
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

  private extractNodeDescription(node: any): string {
    const comments = node.leadingComments || [];
    return comments
      .filter((comment: any) => comment.type === 'Block' && /^\*/.test(comment.value))
      .map((comment: any) => comment.value.replace(/^\*|\*/g, '').trim())
      .join('\n');
  }

  private findEventDispatches(script: any, doc: ComponentDoc) {
    // Look for dispatch calls
    const walkNode = (node: any) => {
      if (node.type === 'CallExpression' && 
          node.callee.name === 'dispatch') {
        const eventName = node.arguments[0]?.value;
        const eventDetail = node.arguments[1] ? this.inferType(node.arguments[1]) : undefined;
        if (eventName && !doc.events.some(e => e.name === eventName)) {
          doc.events.push({
            name: eventName,
            detail: eventDetail || 'void',
            description: ''
          });
        }
      }

      // Recursive walk
      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          walkNode(node[key]);
        }
      }
    };

    walkNode(script);
  }

  private inferEventDetail(expression: any): string {
    if (!expression) return 'void';
    // This could be enhanced to better infer event detail types
    return 'any';
  }
}