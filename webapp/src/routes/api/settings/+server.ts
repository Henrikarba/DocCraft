import { json } from '@sveltejs/kit';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

const STORAGE_PATH = join(process.cwd(), 'storage');
const SETTINGS_PATH = join(STORAGE_PATH, 'settings.json');

export async function GET() {
	try {
		const settings = await readFile(SETTINGS_PATH, 'utf-8');
		return json(JSON.parse(settings));
	} catch (error) {
		// If settings don't exist, create default settings
		const defaultSettings = {
			aiProviders: [
				{
					name: 'openai',
					apiEndpoint: 'https://api.openai.com/v1/chat/completions',
					headers: {
						Authorization: 'Bearer YOUR_API_KEY',
						'Content-Type': 'application/json'
					},
					body: {
						model: 'gpt-4',
						temperature: 0.7,
						max_tokens: 2000
					}
				}
			],
			selectedProvider: 'openai'
		};

		// Create storage directory if it doesn't exist
		await mkdir(STORAGE_PATH, { recursive: true });
		await writeFile(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));

		return json(defaultSettings);
	}
}

export async function POST({ request }) {
	try {
		const settings = await request.json();
		await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2));
		return json({ success: true });
	} catch (error) {
		return json({ success: false, error: 'Failed to save settings' }, { status: 500 });
	}
}
