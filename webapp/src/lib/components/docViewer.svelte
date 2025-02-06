<!-- src/lib/components/docViewer.svelte -->
<script lang="ts">
	import { docStore } from '$lib/docStore';
	import type { ComponentDoc } from '$lib/docStore';
	import { onMount } from 'svelte';
	import fs from 'fs/promises';
	import path from 'path';

	let projects: string[] = [];
	let selectedProject: string | null = null;
	let components: ComponentDoc[] = [];

	onMount(async () => {
		// Load available projects from the docs directory
		try {
			const docsPath = 'src/lib/docs';
			const projectsPath = path.join(docsPath, 'projects');
			const singlePath = path.join(docsPath, 'single');

			// Load projects
			const projectDirs = await fs.readdir(projectsPath);
			projects = ['single', ...projectDirs];
		} catch (error) {
			console.error('Error loading projects:', error);
		}
	});

	async function loadProject(projectName: string) {
		try {
			selectedProject = projectName;
			const docsPath = 'src/lib/docs';
			const basePath =
				projectName === 'single'
					? path.join(docsPath, 'single')
					: path.join(docsPath, 'projects', projectName);

			const files = await fs.readdir(basePath);
			const mdFiles = files.filter((file) => file.endsWith('.md'));

			// Read and parse each markdown file
			const loadedComponents: ComponentDoc[] = [];
			for (const file of mdFiles) {
				const content = await fs.readFile(path.join(basePath, file), 'utf-8');
				// Parse markdown to ComponentDoc
				const component = parseMarkdownToComponent(content);
				loadedComponents.push(component);
			}

			docStore.setDocs(loadedComponents);
			if (loadedComponents.length > 0) {
				docStore.setActiveComponent(loadedComponents[0].name);
			}
		} catch (error) {
			console.error('Error loading project:', error);
		}
	}

	function parseMarkdownToComponent(markdown: string): ComponentDoc {
		// Basic markdown parser - you might want to use a proper markdown parser
		const lines = markdown.split('\n');
		const name = lines[0].replace('# ', '').trim();

		// Initialize component
		const component: ComponentDoc = {
			name,
			description: '',
			props: [],
			events: [],
			slots: [],
			exports: []
		};

		let currentSection: 'props' | 'events' | 'slots' | null = null;
		let descriptionLines: string[] = [];

		for (let i = 1; i < lines.length; i++) {
			const line = lines[i].trim();

			if (line.startsWith('## ')) {
				// If we were collecting description and moving to a new section
				if (descriptionLines.length > 0 && !currentSection) {
					component.description = descriptionLines.join('\n').trim();
					descriptionLines = [];
				}

				// Update current section
				const sectionTitle = line.replace('## ', '').toLowerCase();
				if (sectionTitle === 'props' || sectionTitle === 'events' || sectionTitle === 'slots') {
					currentSection = sectionTitle;
					i += 2; // Skip table header and separator
				} else {
					currentSection = null;
				}
				continue;
			}

			// If we're not in a specific section and the line isn't empty, it's part of the description
			if (!currentSection && line) {
				descriptionLines.push(line);
				continue;
			}

			// Parse table rows
			if (line.startsWith('|')) {
				const cells = line
					.split('|')
					.slice(1, -1)
					.map((cell) => cell.trim());

				switch (currentSection) {
					case 'props':
						component.props.push({
							name: cells[0],
							type: cells[1],
							defaultValue: cells[2] === '-' ? undefined : cells[2],
							required: cells[3] === 'Yes',
							description: cells[4]
						});
						break;
					case 'events':
						component.events.push({
							name: cells[0],
							detail: cells[1],
							description: cells[2]
						});
						break;
					case 'slots':
						component.slots.push({
							name: cells[0],
							props: cells[1] === '-' ? [] : cells[1].split(',').map((p) => p.trim()),
							description: cells[2]
						});
						break;
				}
			}
		}

		// Handle case where description is at the end of the file
		if (descriptionLines.length > 0 && !currentSection) {
			component.description = descriptionLines.join('\n').trim();
		}

		return component;
	}

	$: activeComponent = $docStore.components.find((c) => c.name === $docStore.activeComponent);
</script>

<div class="flex h-full">
	<!-- Project Selection Sidebar -->
	<div class="w-64 border-r bg-gray-50 p-4">
		{#if !selectedProject}
			<h2 class="mb-4 text-lg font-semibold">Select Project</h2>
			<ul class="space-y-2">
				{#each projects as project}
					<li>
						<button
							class="w-full rounded-md px-3 py-2 text-left hover:bg-gray-100"
							on:click={() => loadProject(project)}
						>
							{project === 'single' ? 'Single Files' : project}
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<!-- Component List -->
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Components</h2>
				<button
					class="text-sm text-blue-600 hover:text-blue-800"
					on:click={() => {
						selectedProject = null;
						docStore.clear();
					}}
				>
					← Back
				</button>
			</div>
			<ul class="space-y-2">
				{#each $docStore.components as component}
					<li>
						<button
							class="w-full rounded-md px-3 py-2 text-left {component.name ===
							$docStore.activeComponent
								? 'bg-blue-100 text-blue-700'
								: 'hover:bg-gray-100'}"
							on:click={() => docStore.setActiveComponent(component.name)}
						>
							{component.name}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Main content -->
	<div class="flex-1 overflow-auto p-6">
		{#if !selectedProject}
			<div class="mt-20 text-center text-gray-500">
				<p class="text-xl">
					Select a project or single files from the sidebar to view documentation
				</p>
			</div>
		{:else if activeComponent}
			<div class="mx-auto max-w-4xl">
				<h1 class="mb-4 text-3xl font-bold">{activeComponent.name}</h1>

				{#if activeComponent.description}
					<div class="prose mb-8">
						<p>{activeComponent.description}</p>
					</div>
				{/if}

				{#if activeComponent.props.length > 0}
					<section class="mb-8">
						<h2 class="mb-4 text-xl font-semibold">Props</h2>
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Name</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Type</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Required</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Default</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Description</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 bg-white">
									{#each activeComponent.props as prop}
										<tr>
											<td class="whitespace-nowrap px-6 py-4 font-mono text-sm">{prop.name}</td>
											<td class="whitespace-nowrap px-6 py-4 text-sm text-blue-600">{prop.type}</td>
											<td class="whitespace-nowrap px-6 py-4 text-sm">
												{#if prop.required}
													<span
														class="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800"
													>
														Required
													</span>
												{:else}
													<span
														class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
													>
														Optional
													</span>
												{/if}
											</td>
											<td class="whitespace-nowrap px-6 py-4 text-sm">{prop.defaultValue || '-'}</td
											>
											<td class="px-6 py-4 text-sm">{prop.description || '-'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>
				{/if}

				{#if activeComponent.events.length > 0}
					<section class="mb-8">
						<h2 class="mb-4 text-xl font-semibold">Events</h2>
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Name</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Detail Type</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Description</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 bg-white">
									{#each activeComponent.events as event}
										<tr>
											<td class="whitespace-nowrap px-6 py-4 font-mono text-sm">{event.name}</td>
											<td class="whitespace-nowrap px-6 py-4 text-sm text-blue-600"
												>{event.detail}</td
											>
											<td class="px-6 py-4 text-sm">{event.description || '-'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>
				{/if}

				{#if activeComponent.slots.length > 0}
					<section class="mb-8">
						<h2 class="mb-4 text-xl font-semibold">Slots</h2>
						<div class="overflow-hidden rounded-lg bg-white shadow">
							<table class="min-w-full divide-y divide-gray-200">
								<thead class="bg-gray-50">
									<tr>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Name</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Props</th
										>
										<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500"
											>Description</th
										>
									</tr>
								</thead>
								<tbody class="divide-y divide-gray-200 bg-white">
									{#each activeComponent.slots as slot}
										<tr>
											<td class="whitespace-nowrap px-6 py-4 font-mono text-sm">{slot.name}</td>
											<td class="whitespace-nowrap px-6 py-4 text-sm"
												>{slot.props.join(', ') || '-'}</td
											>
											<td class="px-6 py-4 text-sm">{slot.description || '-'}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</section>
				{/if}
			</div>
		{:else}
			<div class="mt-20 text-center text-gray-500">
				<p class="text-xl">Select a component from the sidebar to view its documentation</p>
			</div>
		{/if}
	</div>
</div>
