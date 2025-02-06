// src/routes/api/enhance/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import fs from 'fs/promises';
import path from 'path';
import type { ComponentDoc, PropDoc, EventDoc, SlotDoc } from '$lib/docStore';

interface OpenAIResponse {
	choices: {
		message: {
			content: string;
		};
	}[];
}

async function enhanceWithAI(content: string, apiKey: string, prompt: string): Promise<string> {
	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: 'gpt-4',
				messages: [
					{
						role: 'system',
						content: prompt
					},
					{
						role: 'user',
						content: `Here's the component documentation to enhance:\n\n${content}`
					}
				],
				temperature: 0.7
			})
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error?.message || 'Failed to enhance documentation');
		}

		const data: OpenAIResponse = await response.json();
		return data.choices[0].message.content;
	} catch (error) {
		console.error('AI Enhancement error:', error);
		throw error;
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const { apiKey, prompt, projectPath, projectName, outputType, outputPath, inputType } =
		await request.json();

	try {
		// Determine docs directory
		const docsPath =
			outputType === 'default'
				? path.join('src/lib/docs', inputType === 'file' ? 'single' : 'projects', projectName)
				: outputPath;

		// Read all markdown files
		const files = await fs.readdir(docsPath);
		const mdFiles = files.filter((file) => file.endsWith('.md'));

		const enhancedComponents: ComponentDoc[] = [];

		// Process each file
		for (const file of mdFiles) {
			const filePath = path.join(docsPath, file);
			const content = await fs.readFile(filePath, 'utf-8');

			// Enhance the content with AI
			const enhancedContent = await enhanceWithAI(content, apiKey, prompt);

			// Save enhanced content
			await fs.writeFile(filePath, enhancedContent, 'utf-8');

			// Parse the enhanced content for viewer
			if (outputType === 'default') {
				enhancedComponents.push(parseMarkdownToComponent(enhancedContent));
			}
		}

		return json({
			success: true,
			message: 'Documentation enhanced successfully',
			components: outputType === 'default' ? enhancedComponents : []
		});
	} catch (error) {
		console.error('Enhancement error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

// Helper function to parse markdown back to component structure
function parseMarkdownToComponent(markdown: string): ComponentDoc {
	const lines = markdown.split('\n');
	const name = lines[0].replace('# ', '').trim();

	const component: ComponentDoc = {
		name,
		description: '',
		props: [],
		events: [],
		slots: [],
		exports: [], // Add empty exports array to match ComponentDoc type
		lastUpdated: new Date() // Add lastUpdated to match ComponentDoc type
	};

	let currentSection = null;
	let descriptionLines = [];

	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line.startsWith('## ')) {
			if (descriptionLines.length > 0 && !currentSection) {
				component.description = descriptionLines.join('\n').trim();
				descriptionLines = [];
			}

			const sectionTitle = line.replace('## ', '').toLowerCase();
			currentSection = sectionTitle;
			i += 2; // Skip table headers
			continue;
		}

		if (!currentSection && line) {
			descriptionLines.push(line);
			continue;
		}

		if (line.startsWith('|')) {
			const cells = line
				.split('|')
				.slice(1, -1)
				.map((cell) => cell.trim());

			switch (currentSection) {
				case 'props':
					if (cells.length >= 5) {
						const prop: PropDoc = {
							name: cells[0],
							type: cells[1],
							defaultValue: cells[2] === '-' ? undefined : cells[2],
							required: cells[3] === 'Yes',
							description: cells[4]
						};
						component.props.push(prop);
					}
					break;
				case 'events':
					if (cells.length >= 3) {
						const event: EventDoc = {
							name: cells[0],
							detail: cells[1],
							description: cells[2]
						};
						component.events.push(event);
					}
					break;
				case 'slots':
					if (cells.length >= 3) {
						const slot: SlotDoc = {
							name: cells[0],
							props: cells[1] === '-' ? [] : cells[1].split(',').map((p) => p.trim()),
							description: cells[2]
						};
						component.slots.push(slot);
					}
					break;
			}
		}
	}

	if (descriptionLines.length > 0 && !currentSection) {
		component.description = descriptionLines.join('\n').trim();
	}

	return component;
}
