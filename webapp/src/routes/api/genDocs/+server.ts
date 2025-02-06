import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DocGenerator } from '$lib/docGenerator';
import { join } from 'path';

// Default storage location for documentation
const DEFAULT_DOCS_PATH = 'src/lib/docs';

export const POST: RequestHandler = async ({ request }) => {
	const { projectPath, projectName, outputType, outputPath, inputType } = await request.json();

	try {
		const generator = new DocGenerator();

		// Determine the output directory
		let finalOutputPath;
		if (outputType === 'default') {
			// For default storage, use project structure
			if (inputType === 'file') {
				finalOutputPath = join(DEFAULT_DOCS_PATH, 'single');
			} else {
				finalOutputPath = join(DEFAULT_DOCS_PATH, 'projects', projectName);
			}
		} else {
			finalOutputPath = outputPath;
		}

		// Generate documentation based on input type
		const docs = await generator.generateDocs(projectPath, finalOutputPath, inputType === 'file');

		return json({
			success: true,
			components: outputType === 'default' ? docs.components : [],
			message: 'Documentation generated successfully'
		});
	} catch (error) {
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
