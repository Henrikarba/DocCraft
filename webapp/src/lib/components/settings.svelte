<script lang="ts">
	import { onMount } from 'svelte';

	type AIProvider = {
		name: string;
		apiEndpoint: string;
		headers: Record<string, string>;
		body: {
			model: string;
			stream: boolean;
			messages: any[];
			[key: string]: any;
		};
	};

	type Settings = {
		aiProviders: AIProvider[];
		selectedProvider: string;
	};

	let settings: Settings;
	let headersText = '';
	let bodyText = '';
	let isSaving = false;
	let status = '';
	let isLoading = true;

	onMount(async () => {
		try {
			const response = await fetch('/api/settings');
			if (!response.ok) {
				throw new Error('Failed to load settings');
			}
			settings = await response.json();
			const currentProvider = settings.aiProviders.find(
				(p) => p.name === settings.selectedProvider
			);
			if (currentProvider) {
				headersText = JSON.stringify(currentProvider.headers || {}, null, 2);
				bodyText = JSON.stringify(currentProvider.body || {}, null, 2);
			}
		} catch (error) {
			console.error('Error loading settings:', error);
			status = 'Error loading settings';
		} finally {
			isLoading = false;
		}
	});

	async function saveSettings() {
		try {
			isSaving = true;
			const currentProvider = settings.aiProviders.find(
				(p) => p.name === settings.selectedProvider
			);
			if (currentProvider) {
				currentProvider.headers = JSON.parse(headersText);
				currentProvider.body = JSON.parse(bodyText);
			}

			const response = await fetch('/api/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(settings)
			});

			if (!response.ok) {
				throw new Error('Failed to save settings');
			}

			status = 'Settings saved successfully';
		} catch (error) {
			status = `Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`;
		} finally {
			isSaving = false;
		}
	}

	function getCurrentProvider() {
		return settings?.aiProviders.find((p) => p.name === settings.selectedProvider);
	}

	function updateEndpoint(event: Event) {
		const newEndpoint = (event.target as HTMLInputElement).value;
		const provider = getCurrentProvider();
		if (provider) {
			provider.apiEndpoint = newEndpoint;
		}
	}

	function addNewProvider() {
		settings.aiProviders.push({
			name: `provider-${settings.aiProviders.length + 1}`,
			apiEndpoint: '',
			headers: {},
			body: {
				model: '',
				stream: false,
				messages: []
			}
		});
		settings.selectedProvider = `provider-${settings.aiProviders.length}`;
		// Reset the text fields
		headersText = JSON.stringify(
			{
				Authorization: 'Bearer KEY',
				'Content-Type': 'application/json'
			},
			null,
			2
		);
		bodyText = JSON.stringify(
			{
				model: '',
				messages: []
			},
			null,
			2
		);
		settings = settings; // Trigger reactivity
	}

	function removeProvider(name: string) {
		if (settings.aiProviders.length <= 1) {
			status = 'Error: Cannot remove the last provider';
			return;
		}
		settings.aiProviders = settings.aiProviders.filter((p) => p.name !== name);
		if (settings.selectedProvider === name) {
			settings.selectedProvider = settings.aiProviders[0].name;
		}
	}

	function updateProviderName(newName: string) {
		const provider = settings.aiProviders.find((p) => p.name === settings.selectedProvider);
		if (provider) {
			const oldName = provider.name;
			provider.name = newName;
			if (settings.selectedProvider === oldName) {
				settings.selectedProvider = newName;
			}
			settings = settings;
		}
	}
</script>

{#if isLoading}
	<div class="flex justify-center p-4">
		<p>Loading settings...</p>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Provider Selection with Add/Remove -->
		<div class="flex items-center justify-between">
			<div class="mr-4 flex-1">
				<label for="provider" class="block text-sm font-medium text-gray-700"> AI Provider </label>
				<select
					id="provider"
					bind:value={settings.selectedProvider}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				>
					{#each settings.aiProviders as provider}
						<option value={provider.name}>{provider.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end space-x-2">
				<button
					type="button"
					on:click={addNewProvider}
					class="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
				>
					Add Provider
				</button>
				<button
					type="button"
					on:click={() => removeProvider(settings.selectedProvider)}
					class="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
				>
					Remove Provider
				</button>
			</div>
		</div>

		<!-- Provider Name -->
		<div>
			<label for="provider-name" class="block text-sm font-medium text-gray-700">
				Provider Name
			</label>
			<input
				id="provider-name"
				type="text"
				value={settings.aiProviders.find((p) => p.name === settings.selectedProvider)?.name ?? ''}
				on:input={(e) => updateProviderName(e.currentTarget.value)}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				placeholder="e.g., openai, anthropic, etc."
			/>
		</div>

		<div>
			<label for="api-endpoint" class="block text-sm font-medium text-gray-700">
				API Endpoint
			</label>
			<input
				id="api-endpoint"
				type="text"
				value={getCurrentProvider()?.apiEndpoint}
				on:input={updateEndpoint}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				placeholder="https://api.aimlapi.com/chat/completions"
			/>
		</div>

		<div>
			<label for="headers-json" class="block text-sm font-medium text-gray-700">
				Headers (JSON)
			</label>
			<textarea
				id="headers-json"
				bind:value={headersText}
				rows="4"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				placeholder={'{\n  "Authorization": "Bearer your-token",\n  "Content-Type": "application/json"\n}'}
			></textarea>
		</div>

		<div>
			<label for="body-template" class="block text-sm font-medium text-gray-700">
				Request Body (JSON)
			</label>
			<textarea
				id="body-template"
				bind:value={bodyText}
				rows="6"
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
				placeholder={'{\n  "model": "gpt-4",\n  "stream": false,\n  "messages": []\n}'}
			></textarea>
		</div>

		<div class="flex items-center justify-between">
			<button
				type="button"
				on:click={saveSettings}
				disabled={isSaving}
				class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
			>
				{isSaving ? 'Saving...' : 'Save Settings'}
			</button>

			{#if status}
				<p class="text-sm {status.includes('Error') ? 'text-red-600' : 'text-green-600'}">
					{status}
				</p>
			{/if}
		</div>
	</div>
{/if}
