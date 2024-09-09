<script lang="ts">
	import { faGlobe, faStar, faUser, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { slide } from 'svelte/transition';
	import { getContext, persisted } from './global';
	import {
		NodeStorage,
		onGraphDragStart,
		userStore,
		type MacroBlock
	} from '@selenite/graph-editor';
	import { animationFrame, Browser, modals, shortcut, sleep, type Filter } from '@selenite/commons';
	import { tick, untrack } from 'svelte';

	// TODO: Remove
	let saved = persisted<string | null>('selected-browser', null);
	type SelectionType = 'favorite' | 'user' | 'shared';
	let selected: SelectionType | null = $state(null);

	// selected = $saved
	// $effect(() => {
	//     $saved = selected;
	// })
	const editorContext = getContext('editor');
	function onclick(id: SelectionType) {
		if (id === selected) {
			selected = null;
			return;
		}
		selected = id;
	}
	let nodeStorage: NodeStorage | undefined = $state();
	$effect(() => {
		for (const f of editorContext.factories) {
			(async () => {

			
			const area = f.area?.area;
			if (!area) return;
			console.log("update state")
			await sleep(210)
			await tick();
			await animationFrame();
			f.transform.zoom = area.transform.k;
			f.surfaceRect = area.content.holder.getBoundingClientRect();
			})();
		}
		if (selected) {
			untrack(() => {
				nodeStorage = NodeStorage.instance;
			});
		}
	});

	const selectedMacros = $derived.by(() => {
		if (!nodeStorage) return;
		switch (selected) {
			case 'favorite':
				return nodeStorage.data.favorites;
			case 'user':
				return nodeStorage.data.userBlocks;
			case 'shared':
				return nodeStorage.graphs;
		}
	});
	const persistedFilters = persisted<Filter<MacroBlock>[]>('macro-browser-filters', []);
	let filters: Filter<MacroBlock>[] = $state($persistedFilters);
	$effect(() => {
		$persistedFilters = $state.snapshot(filters);
	});
	let persistedCurrent = persisted<string[]>('macro-browser-current', []);
	let current = $state<string[]>($persistedCurrent);
	$effect(() => {
		$persistedCurrent = $state.snapshot(current);
	});
</script>

<div class="h-full grid grid-flow-col">
	<menu class="join flex flex-col rounded-none dborder-r border-neutral-content">
		{#snippet SideButton(id: SelectionType, label: string, icon: IconDefinition, key: string)}
			<button
				class="join-item btn rounded-none h-[5rem] w-[5rem] shadow-none focus-visible:outline-none"
				title={`${id === selected ? 'Close' : 'Open'} ${id} macroblocks.\n(Shift+${key.toUpperCase()}, Alt+${key.toUpperCase()})`}
				use:shortcut={{
					shortcuts: [
						{ shift: true, key },
						{ alt: true, key }
					],
					action: (node, e) => {
						onclick(id);
					}
				}}
				class:btn-primary={selected === id}
				onclick={() => onclick(id)}
			>
				<div class="flex flex-col justify-center gap-1.5">
					<Fa {icon} class="text-2xl" />
					<span class="text-xs">{label}</span>
				</div>
			</button>
		{/snippet}
		{@render SideButton('favorite', 'Favorite', faStar, 'f')}
		{@render SideButton('user', 'User', faUser, 'u')}
		{@render SideButton('shared', 'Shared', faGlobe, 's')}
	</menu>
	{#if selectedMacros !== undefined}
		<section
			class="flex flex-col bg-base-100 p-2 h-full border-l-2 border-r-2 border-base-300"
			use:shortcut={{
				key: 'escape',
				action: () => {
					selected = null;
				}
			}}
			transition:slide={{ axis: 'x', duration: 200 }}
		>
			<Browser
				items={selectedMacros}
				filterDefs={[{ key: 'tags' }, { key: 'author' }]}
				bind:filters
				bind:current
				class="mb-2 grow"
				cols={2}
				itemDblClick={(macro) => {
					editorContext.openNewEditor(macro.graph);
				}}
				itemDragStart={(macro, e) => {
					onGraphDragStart(macro)(e);
				}}
				itemAfterUpdate={(macro) => {
					NodeStorage.saveGraph($state.snapshot(macro));
				}}
				itemDelete={(macro) => {
					modals.show({
						title: 'Delete Macro Block ?',
						prompt: 'Type \'yes\' to confirm',
						response(r) {
							if (r !== 'yes') return;
							NodeStorage.deleteMacro(macro.id);
						},
					})
				}}
			>
				{#snippet header()}
					<div class="mb-2 flex justify-between">
						<h2
							class="font-bold text-xl px-2 text-nowrap truncate min-h-8"
							title="Number of macroblocks : {selectedMacros.length}"
						>
							Macro Blocks
						</h2>
						{#if selected === 'user'}
							<input
								bind:value={$userStore}
								title={$userStore}
								placeholder="User"
								class="input input-bordered input-sm w-36 dlg:w-[12rem] truncate"
							/>
						{/if}
					</div>
				{/snippet}
			</Browser>
			<!-- <div class="mb-2 grow relative">
				<div class="absolute inset-0 max-h-full flex justify-center">
					<section
						class="w-[7.5rem] sm:w-[13.5rem] md:w-[21rem] lg:w-[28rem] grid place-content-start justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-clip overflow-y-auto scrollbar-thin px-2"
					>
						{#snippet Library(macro: MacroBlock)}
							<article
								class="flex flex-col items-center cursor-pointer"
								in:fade
								out:fade={{ duration: 50 }}
								draggable="true"
								ondragstart={onGraphDragStart(macro)}
								ondblclick={() => {
									editorContext.openNewEditor(macro.graph);
								}}
							>
								<div
									class="w-[5.95rem] h-[5.95rem] bg-base-300 rounded-box select-none mb-1 overflow-clip"
								>
									<img src="https://via.placeholder.com/150" alt="Library" class="object-cover" />
								</div>
								<h3
									class="w-[5.95rem] text-center text-sm text-wrap max-lines line-clamp-2 font-bold"
									title="Library Name"
								>
								<MatchHighlighter content={macro.name} ref={loweredQuery} />
								</h3>
							</article>
						{/snippet}
						<TreeComponent {tree} leaf={Library}/>F
						{#each filteredMacros as macro}
							{@render Library(macro)}
						{/each}
						
					</section>
				</div>
			</div> -->

			<h1
				class="select-none opacity-50 font-bold text-xl text-right text-nowrap truncate w-full"
				title="MacroBlock Browser"
			>
				MacroBlock Browser
			</h1>
		</section>
	{/if}
</div>
