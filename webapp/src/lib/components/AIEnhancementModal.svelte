<!-- src/lib/components/AIEnhancementModal.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	export let isOpen: boolean;
	export let onClose: () => void;
	export let onEnhance: (apiKey: string, prompt: string, saveKey: boolean) => Promise<void>;

	let apiKey = '';
	let saveKey = false;
	let isProcessing = false;
	let error = '';

	const defaultPrompt = `As a technical documentation expert, enhance the component documentation by:
1. Improving descriptions to be clear and comprehensive
2. Completing any missing documentation
3. Ensuring prop descriptions explain their purpose and usage
4. Clarifying event behaviors and their triggers`;

	let customPrompt = defaultPrompt;

	onMount(async () => {
		// Try to load saved API key
		try {
			const savedKey = localStorage.getItem('openai_api_key');
			if (savedKey) {
				apiKey = savedKey;
				saveKey = true;
			}
		} catch (e) {
			console.error('Error loading saved API key:', e);
		}
	});

	async function handleEnhance() {
		if (!apiKey) {
			error = 'API key is required';
			return;
		}

		isProcessing = true;
		error = '';

		try {
			if (saveKey) {
				localStorage.setItem('openai_api_key', apiKey);
			} else {
				localStorage.removeItem('openai_api_key');
			}

			await onEnhance(apiKey, customPrompt, saveKey);
			onClose();
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			isProcessing = false;
		}
	}

	function resetPrompt() {
		customPrompt = defaultPrompt;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div
			class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0"
		>
			<!-- Background overlay -->
			<div class="fixed inset-0 transition-opacity" aria-hidden="true">
				<div class="absolute inset-0 bg-gray-500 opacity-75"></div>
			</div>

			<!-- Modal panel -->
			<div
				class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle"
			>
				<div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
					<div class="sm:flex sm:items-start">
						<div class="mt-3 w-full text-left sm:mt-0">
							<h3 class="text-lg font-medium leading-6 text-gray-900">
								Enhance Documentation with AI
							</h3>

							<div class="mt-4 space-y-4">
								<!-- API Key Input -->
								<div>
									<label for="api-key" class="block text-sm font-medium text-gray-700">
										OpenAI API Key
									</label>
									<input
										type="password"
										id="api-key"
										bind:value={apiKey}
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
										placeholder="Enter your OpenAI API key"
									/>
								</div>

								<!-- Save Key Checkbox -->
								<div class="flex items-center">
									<input
										id="save-key"
										type="checkbox"
										bind:checked={saveKey}
										class="h-4 w-4 rounded border-gray-300 text-indigo-600"
									/>
									<label for="save-key" class="ml-2 block text-sm text-gray-900">
										Save API key locally for future use
									</label>
								</div>

								<!-- Custom Prompt -->
								<div>
									<div class="flex items-center justify-between">
										<label for="custom-prompt" class="block text-sm font-medium text-gray-700">
											Customization Prompt
										</label>
										<button
											type="button"
											on:click={resetPrompt}
											class="text-sm text-indigo-600 hover:text-indigo-500"
										>
											Reset to Default
										</button>
									</div>
									<textarea
										id="custom-prompt"
										rows="6"
										bind:value={customPrompt}
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									></textarea>
								</div>

								{#if error}
									<div class="rounded-md bg-red-50 p-4">
										<div class="flex">
											<div class="flex-shrink-0">
												<!-- Error Icon -->
												<svg
													class="h-5 w-5 text-red-400"
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fill-rule="evenodd"
														d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
														clip-rule="evenodd"
													/>
												</svg>
											</div>
											<div class="ml-3">
												<p class="text-sm text-red-800">{error}</p>
											</div>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
					<button
						type="button"
						on:click={handleEnhance}
						disabled={isProcessing}
						class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
					>
						{isProcessing ? 'Enhancing...' : 'Enhance Documentation'}
					</button>
					<button
						type="button"
						on:click={onClose}
						class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
