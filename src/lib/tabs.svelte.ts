import { newUuid, type SaveData } from '@selenite/commons';
import type { Snippet } from 'svelte';

export type Tab = {
	label: string;
	id: string;
	onclose: (e: Event) => void;
	onselected?: () => void;
};

export class Tabs {
	#tabs = $state<Tab[]>([]);
	#selected = $state<Tab>();

	get tabs() {
		return this.#tabs;
	}

	set tabs(tabs: Tab[]) {
		this.#tabs = tabs;
	}

	get(id: string) {
		return this.#tabs.find((tab) => tab.id === id);
	}

	setOrder(ids: string[]) {
		this.#tabs = ids.map((id) => this.#tabs.find((tab) => tab.id === id)!);
	}

	get selected() {
		return this.#selected;
	}

	set selected(tab: Tab | undefined) {
		this.#selected = tab;
		if (tab?.onselected) tab.onselected();
	}

	select(id: string) {
		this.selected = this.#tabs.find((tab) => tab.id === id);
	}

	[Symbol.iterator]() {
		return this.#tabs[Symbol.iterator]();
	}

	selectNth(n: number) {
		this.selected = this.#tabs.at(n);
	}

	get length() {
		return this.#tabs.length;
	}

	add(...tabs: Partial<Tab>[]) {
		if (tabs.length === 0) tabs = [{}];
		for (const tab of tabs) {
			const id = tab.id ?? newUuid('tab');
			this.#tabs.push({
				...tab,
				get label() {
					return tab.label ?? 'Tab';
				},
				set label(s: string) {
					tab.label = s;
				},
				id,
				onclose: async (e) => {
					e.stopPropagation();
					e.preventDefault();
					if (tab.onclose) tab.onclose(e);
					const index = this.#tabs.findIndex((t) => t.id === id);
					this.#tabs.splice(index, 1);
					if (id !== this.selected?.id) return;
					this.selected = this.#tabs.at(Math.max(0, index - 1));
				}
			});
		}
		this.selected = this.#tabs.at(-1);
		console.log('tabs', this.#tabs);
	}

	defaultAddCallback = $state<() => void>(() => this.add());

	additionalAddBtn = $state<{ snippet: Snippet, prefetch?:() => void}>()
	additionalAddPopupVisible = $state(false)

	toJSON() {
		return {
			tabs: this.#tabs.map(({ id, label }) => ({ id, label })),
			selected: this.selected?.id
		};
	}

	static load(data?: SaveData<Tabs>) {
		if (data === undefined) return new Tabs();

		const tabs = new Tabs();
		tabs.add(...data.tabs);
		tabs.selected = tabs.#tabs.find((tab) => tab.id === data.selected);
		return tabs;
	}
}
