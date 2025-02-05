// src/lib/stores/documentationStore.ts
import { writable } from 'svelte/store';

export interface ComponentDoc {
  name: string;
  description: string;
  props: PropDoc[];
  events: EventDoc[];
  slots: SlotDoc[];
  lastUpdated: Date;
}

interface PropDoc {
  name: string;
  type: string;
  defaultValue?: string;
  required: boolean;
  description: string;
}

interface EventDoc {
  name: string;
  detail: string;
  description: string;
}

interface SlotDoc {
  name: string;
  props: string[];
  description: string;
}

interface DocStore {
  components: ComponentDoc[];
  activeComponent?: string;
}

function createDocStore() {
  const { subscribe, set, update } = writable<DocStore>({
    components: [],
    activeComponent: undefined
  });

  return {
    subscribe,
    setDocs: (docs: ComponentDoc[]) => update(store => ({
      ...store,
      components: docs
    })),
    setActiveComponent: (name: string) => update(store => ({
      ...store,
      activeComponent: name
    })),
    clear: () => set({ components: [], activeComponent: undefined })
  };
}

export const docStore = createDocStore();