<script lang="ts">
  import { docStore } from '$lib/stores/docStore';
  import type { ComponentDoc } from '$lib/stores/docStore';

  $: activeComponent = $docStore.components.find(
    c => c.name === $docStore.activeComponent
  );
</script>

<div class="h-full flex">
  <!-- Sidebar -->
  <div class="w-64 border-r bg-gray-50 p-4">
    <h2 class="text-lg font-semibold mb-4">Components</h2>
    <ul class="space-y-2">
      {#each $docStore.components as component}
        <li>
          <button
            class="w-full text-left px-3 py-2 rounded-md {component.name === $docStore.activeComponent ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}"
            on:click={() => docStore.setActiveComponent(component.name)}
          >
            {component.name}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <!-- Main content -->
  <div class="flex-1 p-6 overflow-auto">
    {#if activeComponent}
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold mb-4">{activeComponent.name}</h1>
        
        {#if activeComponent.description}
          <div class="prose mb-8">
            <p>{activeComponent.description}</p>
          </div>
        {/if}

        {#if activeComponent.props.length > 0}
          <section class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Props</h2>
            <div class="bg-white shadow overflow-hidden rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each activeComponent.props as prop}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{prop.name}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{prop.type}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        {#if prop.required}
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        {:else}
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Optional
                          </span>
                        {/if}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{prop.defaultValue || '-'}</td>
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
            <h2 class="text-xl font-semibold mb-4">Events</h2>
            <div class="bg-white shadow overflow-hidden rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each activeComponent.events as event}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{event.name}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{event.detail}</td>
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
            <h2 class="text-xl font-semibold mb-4">Slots</h2>
            <div class="bg-white shadow overflow-hidden rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Props</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each activeComponent.slots as slot}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">{slot.name}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">{slot.props.join(', ') || '-'}</td>
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
      <div class="text-center text-gray-500 mt-20">
        <p class="text-xl">Select a component from the sidebar to view its documentation</p>
      </div>
    {/if}
  </div>
</div>