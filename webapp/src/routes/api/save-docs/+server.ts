import { json } from '@sveltejs/kit';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST({ request }) {
	try {
		const { content, filename } = await request.json();

		// Create storage directory if it doesn't exist
		const storageDir = join(process.cwd(), 'storage', 'docs');
		await mkdir(storageDir, { recursive: true });

		// Save the file
		const filePath = join(storageDir, filename);
		await writeFile(filePath, content);

		return json({ success: true, path: filePath });
	} catch (error) {
		console.error('Error saving documentation:', error);
		return json({ success: false, error: 'Failed to save documentation' }, { status: 500 });
	}
}
