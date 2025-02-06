// src/lib/stores/documentationStore.ts
import { writable } from 'svelte/store';

export interface ComponentDoc {
	name: string;
	description: string;
	props: PropDoc[];
	events: EventDoc[];
	slots: SlotDoc[];
	exports: string[];
	lastUpdated?: Date;
}

export interface PropDoc {
	name: string;
	type: string;
	defaultValue?: string;
	required: boolean;
	description: string;
}

export interface EventDoc {
	name: string;
	detail: string;
	description: string;
}

export interface SlotDoc {
	name: string;
	props: string[];
	description: string;
}

export interface DocStore {
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
		setDocs: (docs: ComponentDoc[]) =>
			update((store) => ({
				...store,
				components: docs
			})),
		setActiveComponent: (name: string) =>
			update((store) => ({
				...store,
				activeComponent: name
			})),
		clear: () => set({ components: [], activeComponent: undefined })
	};
}

export const docStore = createDocStore();
