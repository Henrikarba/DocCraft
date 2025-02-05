import { SvelteParser } from './svelteParser';
import type { ComponentDoc } from './svelteParser';
import fs from 'fs/promises';
import path from 'path';

export class DocGenerator {
  private parser: SvelteParser;

  constructor() {
    this.parser = new SvelteParser();
  }

  async generateDocs(projectPath: string, outputPath: string): Promise<void> {
    // Ensure output directory exists
    await fs.mkdir(outputPath, { recursive: true });

    // Find all Svelte files
    const svelteFiles = await this.findSvelteFiles(projectPath);

    // Process each file
    for (const file of svelteFiles) {
      try {
        // Read the file
        const source = await fs.readFile(file, 'utf-8');
        
        // Parse the component
        const componentDoc = await this.parser.parseComponent(source, file);
        
        // Generate markdown
        const markdown = this.generateMarkdown(componentDoc);
        
        // Write to output file
        const outputFile = path.join(
          outputPath, 
          `${componentDoc.name}.md`
        );
        await fs.writeFile(outputFile, markdown);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }

  private async findSvelteFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    async function walk(directory: string) {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.svelte')) {
          files.push(fullPath);
        }
      }
    }

    await walk(dir);
    return files;
  }

  private generateMarkdown(doc: ComponentDoc): string {
    let markdown = `# ${doc.name}\n\n`;

    if (doc.description) {
      markdown += `${doc.description}\n\n`;
    }

    if (doc.props.length > 0) {
      markdown += '## Props\n\n';
      markdown += '| Name | Type | Default | Required | Description |\n';
      markdown += '|------|------|---------|----------|-------------|\n';
      doc.props.forEach(prop => {
        markdown += `| ${prop.name} | ${prop.type} | ${prop.defaultValue || '-'} | ${prop.required ? 'Yes' : 'No'} | ${prop.description || '-'} |\n`;
      });
      markdown += '\n';
    }

    if (doc.events.length > 0) {
      markdown += '## Events\n\n';
      markdown += '| Name | Detail | Description |\n';
      markdown += '|------|--------|-------------|\n';
      doc.events.forEach(event => {
        markdown += `| ${event.name} | ${event.detail} | ${event.description || '-'} |\n`;
      });
      markdown += '\n';
    }

    if (doc.slots.length > 0) {
      markdown += '## Slots\n\n';
      markdown += '| Name | Props | Description |\n';
      markdown += '|------|-------|-------------|\n';
      doc.slots.forEach(slot => {
        markdown += `| ${slot.name} | ${slot.props.join(', ') || '-'} | ${slot.description || '-'} |\n`;
      });
      markdown += '\n';
    }

    return markdown;
  }
}