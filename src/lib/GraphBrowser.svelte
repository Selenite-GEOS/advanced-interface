<script lang="ts">
	import {
		faGlobe,
		faSearch,
		faStar,
		faUser,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { fade, slide } from 'svelte/transition';
	import { persisted } from './global';
	import { NodeStorage } from '@selenite/graph-editor';
	import { resizable, shortcut } from '@selenite/commons';

	// TODO: Remove
	let saved = persisted<string | null>('selected-browser', null);
	let selected: string | null = $state(null);

	// selected = $saved
	// $effect(() => {
	//     $saved = selected;
	// })

	function onclick(id: string) {
		if (id === selected) {
			selected = null;
			return;
		}
		selected = id;
	}
</script>

<div class="h-full grid grid-flow-col">
	<menu class=" join flex flex-col rounded-none dborder-r border-neutral-content">
		{#snippet SideButton(id: string, label: string, icon: IconDefinition, key: string)}
			<button
				class="join-item btn rounded-none h-[5rem] w-[5rem] shadow-none"
				use:shortcut={{
					shift: true,
					key,
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
	{#if selected}
		<section
			class="flex flex-col bg-base-200 w-[9rem] sm:w-[15rem] md:w-[22rem] lg:w-[29rem] p-2 h-full border-l-2 border-r-2 border-base-300 relative"
			transition:slide={{ axis: 'x', duration: 200 }}
		>
			<label class="input input-bordered flex items-center w-full mb-2">
				<input type="search" class="w-full" placeholder="Search" />
				<Fa icon={faSearch} class="hidden opacity-80 sm:block" />
			</label>
			<h2 class="font-bold text-xl mb-2 px-2 text-nowrap truncate">Macro Blocks ({NodeStorage.numGraphs})</h2>
			<div class="mb-2 grow relative">
				<div class="absolute inset-0 max-h-full flex justify-center">
					<section
						class="w-[7.5rem] sm:w-[13.5rem] md:w-[21rem] lg:w-[28rem] grid place-content-start justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-clip overflow-y-auto scrollbar-thin px-2"
					>
						{#snippet Library()}
							<article class="flex flex-col items-center" in:fade out:fade={{ duration: 50 }}>
								<div
									class="w-[5.95rem] h-[5.95rem] bg-base-300 rounded-box select-none mb-1 overflow-clip"
								>
									<img src="https://via.placeholder.com/150" alt="Library" class="object-cover" />
								</div>
								<h3
									class="w-[5.95rem] text-center text-sm text-wrap max-lines line-clamp-2"
									title="Library Name"
								>
									Library Name
								</h3>
							</article>
						{/snippet}
						{@render Library()}
						{@render Library()}
						{@render Library()}
						{@render Library()}
						{@render Library()}
						{@render Library()}
						{@render Library()}
					</section>
				</div>
			</div>

			<h1
				class="select-none opacity-50 font-bold text-xl text-right text-nowrap truncate w-full"
				title="MacroBlock Browser"
			>
				MacroBlock Browser
			</h1>
		</section>
	{/if}
</div>
