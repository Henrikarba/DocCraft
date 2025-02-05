<script lang="ts">
	import { docStore } from '$lib/docStore';
	import type { ComponentDoc } from '$lib/docStore';

	$: activeComponent = $docStore.components.find((c) => c.name === $docStore.activeComponent);
</script>

<div class="flex h-full">
	<!-- Sidebar -->
	<div class="w-64 border-r bg-gray-50 p-4">
		<h2 class="mb-4 text-lg font-semibold">Components</h2>
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
	</div>

	<!-- Main content -->
	<div class="flex-1 overflow-auto p-6">
		{#if activeComponent}
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
