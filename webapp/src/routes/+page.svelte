<script lang="ts">
	import DocViewer from '$lib/components/docViewer.svelte';
	import AIEnhancementModal from '$lib/components/AIEnhancementModal.svelte';
	import { docStore } from '$lib/docStore';

	let inputType: 'file' | 'folder' = 'folder';
	let projectPath = '';
	let projectName = '';
	let outputType: 'default' | 'custom' = 'default';
	let outputPath = '';
	let isProcessing = false;
	let status = '';
	let activeTab: 'generate' | 'view' = 'generate';
	let showAIModal = false;
	let docsGenerated = false;

	async function handleGenerate() {
		if (!projectPath) {
			status = 'Please select project directory or file';
			return;
		}

		isProcessing = true;
		status = 'Generating documentation...';

		try {
			const response = await fetch('/api/genDocs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					projectPath,
					projectName: projectName || getDefaultProjectName(projectPath),
					outputType,
					outputPath,
					inputType
				})
			});

			if (!response.ok) throw new Error('Failed to generate documentation');

			const docs = await response.json();
			if (outputType === 'default') {
				docStore.setDocs(docs.components);
				status = 'Documentation generated successfully!';
				docsGenerated = true;
				activeTab = 'view';
			} else {
				status = 'Documentation saved to selected location!';
				docsGenerated = true;
			}
		} catch (error) {
			status = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			isProcessing = false;
		}
	}

	async function handleAIEnhance(apiKey: string, prompt: string, saveKey: boolean) {
		isProcessing = true;
		status = 'Enhancing documentation with AI...';

		try {
			const response = await fetch('/api/aiEnhance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					apiKey,
					prompt,
					projectPath,
					projectName: projectName || getDefaultProjectName(projectPath),
					outputType,
					outputPath,
					inputType
				})
			});

			if (!response.ok) throw new Error('Failed to enhance documentation');

			const docs = await response.json();
			if (outputType === 'default') {
				docStore.setDocs(docs.components);
				status = 'Documentation enhanced successfully!';
			} else {
				status = 'Enhanced documentation saved to selected location!';
			}
		} catch (error) {
			throw new Error(
				`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			isProcessing = false;
		}
	}

	function getDefaultProjectName(path: string): string {
		return path.split('/').pop()?.split('.')[0] || 'unnamed-project';
	}

	async function selectPath(type: 'input' | 'output') {
		try {
			let handle;
			if (type === 'input') {
				if (inputType === 'file') {
					const [fileHandle] = await (window as any).showOpenFilePicker({
						types: [
							{
								description: 'Supported Files',
								accept: {
									'text/plain': ['.svelte', '.go' /* Add more supported file types here */]
								}
							}
						]
					});
					handle = fileHandle;
				} else {
					handle = await (window as any).showDirectoryPicker();
				}
				projectPath = handle.name;
				projectName = getDefaultProjectName(handle.name);
			} else {
				handle = await (window as any).showDirectoryPicker();
				outputPath = handle.name;
			}
		} catch (error) {
			status = `Error selecting ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header and tabs remain the same -->

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		{#if activeTab === 'generate'}
			<div class="space-y-6 rounded-lg bg-white p-6 shadow">
				<!-- Framework Selection remains the same -->

				<!-- Input Type Selection -->
				<div>
					<label for="Input Type" class="block text-sm font-medium text-gray-700">Input Type</label>
					<div class="mt-2 space-x-4">
						<label class="inline-flex items-center">
							<input type="radio" bind:group={inputType} value="file" class="form-radio" />
							<span class="ml-2">Single File</span>
						</label>
						<label class="inline-flex items-center">
							<input type="radio" bind:group={inputType} value="folder" class="form-radio" />
							<span class="ml-2">Project Folder</span>
						</label>
					</div>
				</div>

				<!-- Input Path -->
				<div>
					<label
						for={inputType === 'file' ? 'Select File' : 'Select Project Directory'}
						class="block text-sm font-medium text-gray-700"
					>
						{inputType === 'file' ? 'Select File' : 'Select Project Directory'}
					</label>
					<div class="mt-1 flex rounded-md shadow-sm">
						<input
							type="text"
							bind:value={projectPath}
							readonly
							placeholder={inputType === 'file' ? 'Select file' : 'Select project directory'}
							class="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-gray-50 px-3 py-2"
						/>
						<button
							type="button"
							on:click={() => selectPath('input')}
							class="inline-flex items-center rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
						>
							Browse
						</button>
					</div>
				</div>

				<!-- Project Name (only shown for folders) -->
				{#if inputType === 'folder'}
					<div>
						<label for="Project Name" class="block text-sm font-medium text-gray-700"
							>Project Name</label
						>
						<input
							type="text"
							bind:value={projectName}
							placeholder="Enter project name"
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
						/>
					</div>
				{/if}

				<!-- Output Type Selection -->
				<div>
					<label for="Output Location" class="block text-sm font-medium text-gray-700"
						>Output Location</label
					>
					<div class="mt-2 space-x-4">
						<label class="inline-flex items-center">
							<input type="radio" bind:group={outputType} value="default" class="form-radio" />
							<span class="ml-2">View in DocViewer</span>
						</label>
						<label class="inline-flex items-center">
							<input type="radio" bind:group={outputType} value="custom" class="form-radio" />
							<span class="ml-2">Custom Location</span>
						</label>
					</div>
				</div>

				<!-- Custom Output Path -->
				{#if outputType === 'custom'}
					<div>
						<label for="Output Directory" class="block text-sm font-medium text-gray-700"
							>Output Directory</label
						>
						<div class="mt-1 flex rounded-md shadow-sm">
							<input
								type="text"
								bind:value={outputPath}
								readonly
								placeholder="Select output directory"
								class="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-gray-50 px-3 py-2"
							/>
							<button
								type="button"
								on:click={() => selectPath('output')}
								class="inline-flex items-center rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
							>
								Browse
							</button>
						</div>
					</div>
				{/if}

				<!-- Generate and Enhance Buttons -->
				<div class="flex flex-col space-y-4">
					<button
						type="button"
						on:click={handleGenerate}
						disabled={isProcessing || !projectPath || (outputType === 'custom' && !outputPath)}
						class="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{isProcessing ? 'Generating...' : 'Generate Documentation'}
					</button>

					{#if docsGenerated}
						<button
							type="button"
							on:click={() => (showAIModal = true)}
							disabled={isProcessing}
							class="flex w-full justify-center rounded-md border border-indigo-600 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Enhance with AI
						</button>
					{/if}
				</div>

				<!-- Status Message -->
				{#if status}
					<div
						class="rounded-md p-4 {status.includes('Error')
							? 'bg-red-50 text-red-700'
							: 'bg-green-50 text-green-700'}"
					>
						{status}
					</div>
				{/if}
			</div>
		{:else}
			<!-- DocViewer tab content -->
		{/if}

		<AIEnhancementModal
			isOpen={showAIModal}
			onClose={() => (showAIModal = false)}
			onEnhance={handleAIEnhance}
		/>
	</main>
</div>
