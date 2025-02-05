<script lang="ts">
    import DocViewer from '$lib/components/docViewer.svelte';
    import { docStore } from '$lib/stores/docStore';
    import type { ComponentDoc } from '$lib/stores/docStore';

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
      const dirHandle = await window.showDirectoryPicker();
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
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-3xl font-bold text-gray-900">Documentation Generator</h1>
      </div>
    </header>
  
    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            class="
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              {activeTab === 'generate' 
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            "
            on:click={() => activeTab = 'generate'}
          >
            Generate
          </button>
          <button
            class="
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              {activeTab === 'view'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            "
            on:click={() => activeTab = 'view'}
          >
            View Documentation
          </button>
        </nav>
      </div>
    </div>  
  
    <main class="max-w-7xl mx-auto py-6 px-4">
        {#if activeTab === "generate"}
      <div class="bg-white shadow rounded-lg p-6 space-y-6">
        <!-- Framework Selection -->
        <div>
          <label for="framework" class="block text-sm font-medium text-gray-700">Framework</label>
          <select
            id="framework"
            bind:value={selectedFramework}
            class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
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
          <label class="block text-sm font-medium text-gray-700">Project Directory</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              bind:value={projectPath}
              readonly
              placeholder="Select project directory"
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50"
            />
            <button
              type="button"
              on:click={() => selectDirectory('project')}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse
            </button>
          </div>
        </div>
  
        <!-- Output Directory -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Output Directory</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              bind:value={outputPath}
              readonly
              placeholder="Select output directory"
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50"
            />
            <button
              type="button"
              on:click={() => selectDirectory('output')}
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            disabled={isProcessing || !projectPath || !outputPath}
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Generating...' : 'Generate Documentation'}
          </button>
        </div>
  
        <!-- Status Message -->
        {#if status}
          <div class="rounded-md p-4 {status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}">
            {status}
          </div>
        {/if}
      </div>
      {:else if activeTab === "view"}
      {/if}
    </main>
  </div>