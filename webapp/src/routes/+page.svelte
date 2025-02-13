<script lang="ts">
	import { onMount } from 'svelte';
	import type { Settings } from '$lib/types/settings';
	import { parseTypescript } from '$lib/parsers/typescript';
	import { parseSvelte } from '$lib/parsers/svelte';
	import SettingsTab from '$lib/components/settings.svelte';

	let selectedType: 'file' | 'folder' = 'file';
	let fileInput: HTMLInputElement;
	let selectedFiles: FileList | null = null;
	let settings: Settings;
	let isProcessing = false;
	let documentationOutput: any[] = [];
	let activeTab: 'generator' | 'settings' = 'generator';
	let progress = {
		current: 0,
		total: 0,
		currentFileName: ''
	};

	onMount(async () => {
		try {
			const response = await fetch('/api/settings');
			settings = await response.json();
		} catch (error) {
			console.error('Failed to load settings:', error);
			alert('Failed to load settings. Please check storage/settings.json file.');
		}
	});

	async function processFiles(files: File[]) {
		const docs = [];

		for (const file of files) {
			progress.currentFileName = file.name;
			progress.current++;

			const content = await file.text();
			const extension = file.name.split('.').pop()?.toLowerCase();

			let parsedContent;
			if (extension === 'ts' || extension === 'tsx') {
				parsedContent = await parseTypescript(content, file.name);
			} else if (extension === 'svelte') {
				parsedContent = await parseSvelte(content, file.name);
			}

			if (parsedContent) {
				const aiResponse = await processWithAI(JSON.stringify(parsedContent));
				docs.push({
					fileName: file.name,
					documentation: aiResponse
				});
			}
		}

		return docs;
	}

	async function processWithAI(content: string) {
		const provider = settings.aiProviders.find((p) => p.name === settings.selectedProvider);
		if (!provider) throw new Error('No AI provider selected');

		const response = await fetch(provider.apiEndpoint, {
			method: 'POST',
			headers: provider.headers,
			body: JSON.stringify({
				...provider.body,
				messages: [
					{
						role: 'user',
						content: `Generate documentation for this parsed code:\n\n${content}`
					}
				]
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Full error response:', errorText); // For debugging
			throw new Error(`AI API request failed: ${errorText}`);
		}

		return response.json();
	}

	function generateMarkdownFile(docs: any[]) {
		let markdown = `# Project Documentation\n\n`;

		docs.forEach((doc) => {
			markdown += `## ${doc.fileName}\n\n`;

			if (typeof doc.documentation === 'string') {
				markdown += doc.documentation;
			} else if (doc.documentation.choices?.[0]?.message?.content) {
				// OpenAI format
				markdown += doc.documentation.choices[0].message.content;
			} else if (doc.documentation.content) {
				// Generic format
				markdown += doc.documentation.content;
			}

			markdown += '\n\n---\n\n';
		});

		return markdown;
	}

	async function saveDocumentation(content: string, filename: string) {
		const response = await fetch('/api/save-docs', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content,
				filename
			})
		});

		if (!response.ok) {
			throw new Error('Failed to save documentation');
		}

		return response.json();
	}

	async function handleSubmit() {
		if (!selectedFiles || selectedFiles.length === 0) {
			alert('Please select a file or folder first');
			return;
		}

		isProcessing = true;
		progress.total = selectedFiles.length;
		progress.current = 0;
		documentationOutput = [];

		try {
			const files = Array.from(selectedFiles);
			const documentation = await processFiles(files);

			// Generate markdown
			const markdown = generateMarkdownFile(documentation);

			// Save to storage folder
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `documentation-${timestamp}.md`;

			const result = await saveDocumentation(markdown, filename);

			if (result.success) {
				alert('Documentation saved successfully!');
			} else {
				throw new Error('Failed to save documentation');
			}

			// Store for preview if needed
			documentationOutput = documentation;
		} catch (error) {
			console.error('Error generating documentation:', error);
			alert('An error occurred while generating documentation');
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-8">
	<div class="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
		<!-- Tabs -->
		<div class="border-b border-gray-200">
			<nav class="-mb-px flex">
				<button
					class="px-6 py-4 {activeTab === 'generator'
						? 'border-b-2 border-blue-500 text-blue-600'
						: 'text-gray-500'}"
					on:click={() => (activeTab = 'generator')}
				>
					Generator
				</button>
				<button
					class="px-6 py-4 {activeTab === 'settings'
						? 'border-b-2 border-blue-500 text-blue-600'
						: 'text-gray-500'}"
					on:click={() => (activeTab = 'settings')}
				>
					Settings
				</button>
			</nav>
		</div>

		<!-- Content -->
		<div class="p-6">
			{#if activeTab === 'generator'}
				<h1 class="mb-6 text-2xl font-bold">Documentation Generator</h1>

				<div class="space-y-6">
					<!-- Selection Type -->
					<div class="flex space-x-4">
						<label class="flex items-center">
							<input type="radio" name="type" value="file" bind:group={selectedType} class="mr-2" />
							Single File
						</label>
						<label class="flex items-center">
							<input
								type="radio"
								name="type"
								value="folder"
								bind:group={selectedType}
								class="mr-2"
							/>
							Folder
						</label>
					</div>

					<!-- File Input -->
					<div class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
						<input
							type="file"
							bind:this={fileInput}
							bind:files={selectedFiles}
							webkitdirectory={selectedType === 'folder'}
							multiple={selectedType === 'folder'}
							class="hidden"
							on:change={() => console.log('Files selected:', selectedFiles)}
						/>

						<button
							class="rounded-md bg-blue-50 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-100"
							on:click={() => fileInput.click()}
						>
							{selectedType === 'file' ? 'Choose File' : 'Choose Folder'}
						</button>

						{#if selectedFiles && selectedFiles.length > 0}
							<div class="mt-4 text-sm text-gray-600">
								{selectedFiles.length}
								{selectedFiles.length === 1 ? 'file' : 'files'} selected
							</div>
						{/if}
					</div>
				</div>

				<!-- Progress Indicator -->
				{#if isProcessing}
					<div class="mt-4 space-y-2">
						<div class="h-2.5 w-full rounded-full bg-gray-200">
							<div
								class="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
								style="width: {(progress.current / progress.total) * 100}%"
							></div>
						</div>
						<div class="text-sm text-gray-600">
							Processing {progress.currentFileName} ({progress.current}/{progress.total})
						</div>
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					class="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
					on:click={handleSubmit}
					disabled={isProcessing || !selectedFiles}
				>
					{isProcessing ? 'Generating Documentation...' : 'Generate Documentation'}
				</button>

				<!-- Current AI Provider Display -->
				{#if settings}
					<div class="mt-4 text-sm text-gray-600">
						Using AI Provider: {settings.selectedProvider}
					</div>
				{/if}
			{:else if activeTab === 'settings'}
				<h1 class="mb-6 text-2xl font-bold">Settings</h1>
				<SettingsTab />
			{/if}
		</div>
	</div>
</div>
