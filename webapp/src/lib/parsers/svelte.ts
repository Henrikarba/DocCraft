export async function parseSvelte(content: string, fileName: string) {
	// Extract script section
	const scriptMatch = content.match(/<script.*?>([\s\S]*?)<\/script>/);
	const scriptContent = scriptMatch?.[1] || '';

	// Extract props
	const propsMatch = scriptMatch?.[0].match(/export\s+let\s+(\w+)(\s*:\s*([^;]+))?/g) || [];
	const props: Record<string, string> = {};

	propsMatch.forEach((prop) => {
		const [name, type] = prop
			.replace('export let ', '')
			.split(':')
			.map((s) => s.trim());
		props[name] = type || 'any';
	});

	return {
		fileName,
		type: 'component',
		props,
		scripts: [{ type: 'script', content: scriptContent }]
	};
}
