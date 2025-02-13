export async function parseTypescript(content: string, fileName: string) {
	// Basic regex-based parsing to extract essentials
	const exportMatches =
		content.match(/export\s+(const|function|class|interface|type)\s+(\w+)/g) || [];
	const exports = exportMatches.map((exp) => exp.split(/\s+/).pop() || '');

	// Extract comments above exports
	const description = content.match(/\/\*\*([\s\S]*?)\*\//)?.[1]?.trim() || '';

	return {
		fileName,
		type: 'typescript',
		exports,
		description
	};
}
