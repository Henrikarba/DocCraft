<script lang="ts">
	import DocViewer from '$lib/components/docViewer.svelte';
	import { docStore } from '$lib/docStore';
	import type { ComponentDoc } from '$lib/docStore';

	const frameworks = [
		{ id: 'svelte', label: 'Svelte' },
		{ id: 'react', label: 'React (Coming Soon)', disabled: true },
		{ id: 'vue', label: 'Vue (Coming Soon)', disabled: true }
	];

	let selectedFramework = 'svelte';
	let projectPath = '';
	let outputPath = '';
	let isProcessing = false;
	let status = '';
	let activeTab: 'generate' | 'view' = 'generate';

	async function handleGenerate() {
		if (!projectPath) {
			status = 'Please select project directory';
			return;
		}

		isProcessing = true;
		status = 'Generating documentation...';

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ projectPath })
			});

			if (!response.ok) throw new Error('Failed to generate documentation');

			const docs = await response.json();
			docStore.setDocs(docs.components);
			status = 'Documentation generated successfully!';

			// Switch to view tab
			activeTab = 'view';
		} catch (error) {
			status = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
		} finally {
			isProcessing = false;
		}
	}

	async function selectDirectory(type: 'project' | 'output') {
		try {
			const picker = (window as any)
				.showDirectoryPicker as () => Promise<FileSystemDirectoryHandle>;
			const dirHandle = await picker();
			const path = dirHandle.name;

			if (type === 'project') {
				projectPath = path;
			} else {
				outputPath = path;
			}
		} catch (error) {
			status = `Error selecting directory: ${error instanceof Error ? error.message : 'Unknown error'}`;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-6">
			<h1 class="text-3xl font-bold text-gray-900">Documentation Generator</h1>
		</div>
	</header>

	<!-- Tabs -->
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="border-b border-gray-200">
			<nav class="-mb-px flex space-x-8" aria-label="Tabs">
				<button
					class="
            whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium
            {activeTab === 'generate'
						? 'border-indigo-500 text-indigo-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
          "
					on:click={() => (activeTab = 'generate')}
				>
					Generate
				</button>
				<button
					class="
            whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium
            {activeTab === 'view'
						? 'border-indigo-500 text-indigo-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
          "
					on:click={() => (activeTab = 'view')}
				>
					View Documentation
				</button>
			</nav>
		</div>
	</div>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		{#if activeTab === 'generate'}
			<div class="space-y-6 rounded-lg bg-white p-6 shadow">
				<!-- Your existing form content -->
				<!-- Framework Selection -->
				<div>
					<label for="framework" class="block text-sm font-medium text-gray-700">Framework</label>
					<select
						id="framework"
						bind:value={selectedFramework}
						class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
					>
						{#each frameworks as framework}
							<option value={framework.id} disabled={framework.disabled}>
								{framework.label}
							</option>
						{/each}
					</select>
				</div>

				<!-- Project Directory -->
				<div>
					<label for="project-directory" class="block text-sm font-medium text-gray-700"
						>Project Directory</label
					>
					<div class="mt-1 flex rounded-md shadow-sm">
						<input
							id="project-directory"
							type="text"
							bind:value={projectPath}
							readonly
							placeholder="Select project directory"
							class="block w-full min-w-0 flex-1 rounded-l-md border border-gray-300 bg-gray-50 px-3 py-2"
						/>
						<button
							type="button"
							on:click={() => selectDirectory('project')}
							class="inline-flex items-center rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							Browse
						</button>
					</div>
				</div>

				<!-- Generate Button -->
				<div>
					<button
						type="button"
						on:click={handleGenerate}
						disabled={isProcessing || !projectPath}
						class="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{isProcessing ? 'Generating...' : 'Generate Documentation'}
					</button>
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
			<!-- Documentation Viewer Tab -->
			<div class="overflow-hidden rounded-lg bg-white shadow" style="height: calc(100vh - 200px);">
				{#if $docStore.components.length > 0}
					<DocViewer />
				{:else}
					<div class="flex h-full items-center justify-center">
						<div class="text-center">
							<h3 class="mb-2 text-lg font-medium text-gray-900">No documentation generated yet</h3>
							<p class="text-gray-500">
								Generate documentation first by switching to the Generate tab
							</p>
							<button
								class="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
								on:click={() => (activeTab = 'generate')}
							>
								Switch to Generate
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>
