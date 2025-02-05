import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DocGenerator } from '$lib/svelte/docGenerator';

export const POST: RequestHandler = async ({ request }) => {
  const { projectPath, outputPath } = await request.json();

  try {
    const generator = new DocGenerator();
    await generator.generateDocs(projectPath, outputPath);
    
    return json({
      success: true,
      message: 'Documentation generated successfully'
    });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};