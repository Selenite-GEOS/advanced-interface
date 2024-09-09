<script lang="ts">
	import { setContext, Tabs, type Tab, type Contexts, GeosContext } from '$lib';
	import {
		draggableItem,
		horizontalScroll,
		parseXsdFromUrl,
		scrollIntoView,
		shortcut,
		XmlSchema,
		takeFocus,
		handleFocusLeave,
		ContextMenu as ContextMenuComponent,
		ModalComponent,
		Modal,
	} from '@selenite/commons';
	import {
		notifications,
		NotificationsComponent,
		
		type NodeEditorSaveData
	} from '@selenite/graph-editor';
	import '../app.css';
	import {
		faEllipsisH,
		faPlus,
		faTimes,
		faExternalLinkAlt,
		faCaretDown
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import ThemeSelector from '$lib/ThemeSelector.svelte';
	import { flip } from 'svelte/animate';
	import { createFloatingActions } from 'svelte-floating-ui';
	import { offset } from 'svelte-floating-ui/core';
	let { children } = $props();

	const tabs = new Tabs();
	setContext('tabs', tabs);
	const saveCallbacks: Contexts['saves'] = $state(new Set());
	setContext('saves', saveCallbacks);

	function save() {
		let numErrors = 0;
		for (const saveCallback of saveCallbacks) {
			try {
				saveCallback();
			} catch (e) {
				console.error(e);
				numErrors++;
			}
		}
		if (numErrors === 0) notifications.success({ message: 'Saved!', title: 'Save' });
		else notifications.error({ message: 'Some errors occured while saving.', title: 'Save' });
	}
	setContext('save', save);
	const geosContext = $state(new GeosContext());
	let geosSchema = $state<XmlSchema>();
	setContext('geos', {
		get schema() {
			return geosSchema;
		},
		set schema(schema) {
			geosSchema = schema;
		}
	});
	// Parse XML Schema Definition file for GEOS
	$effect(() => {
		parseXsdFromUrl('geos_schema.xsd').then((schema) => {
			console.log('GEOS Schema parsed', schema);
			geosSchema = schema;
		});
	});
	const [specialAddRef, specialAddPopup] = createFloatingActions({
		middleware: [offset({ crossAxis: 1 })],
		placement: 'bottom-start'
	});
</script>

{#snippet RenameTabModal(tab: Tab)}
	<input bind:value={tab.label} class="input input-bordered text-base-content" />
{/snippet}

{#if tabs.additionalAddPopupVisible && tabs.additionalAddBtn}
	{@const btn = tabs.additionalAddBtn}
	<div
		role="menu"
		tabindex="-1"
		use:specialAddPopup
		use:takeFocus={true}
		use:handleFocusLeave={() => (tabs.additionalAddPopupVisible = false)}
		class="z-50 bg-neutral p-2 rounded-box flex gap-2 flex-col rounded-tl-none"
	>
		{@render btn.snippet()}
	</div>
{/if}

<div
	class="grid grid-rows-[0fr,1fr] h-screen w-screen overflow-clip"
	use:shortcut={{ key: 's', ctrl: true, action: save, ignoreElements: [] }}
	use:shortcut={{
		shortcuts(e) {
			// Tabs shortcuts
			const pos = parseInt(e.key);
			if (!isNaN(pos)) {
				tabs.selectNth(pos === 0 ? -1 : pos - 1);
				return true;
			}
			const chars = `&é"'(-è_çà`;
			const index = chars.indexOf(e.key);
			if (index !== -1) {
				tabs.selectNth(index === chars.length - 1 ? -1 : index);
				return true;
			}
			return false;
		}
	}}
>
	<header
		class="grid grid-cols-[0fr,1fr,0fr] items-center bg-base-300 gap-4 relative h-12 dborder-b border-neutral-content"
	>
		<h1 class="text-xl font-bold ms-4">GEOS</h1>

		<div
			role="tablist"
			use:horizontalScroll
			class="tabs tabs-lifted grow justify-start self-stretch w-full overflow-y-hidden overflow-x-auto scrollbar-thin"
		>
			{#each tabs.tabs as tab (tab.id)}
				<!-- Tab -->
				<div
					tabindex="0"
					role="tab"
					class="tab !cursor-pointer relative group min-w-[7.5rem] max-w-[14rem]"
					class:tab-active={tabs.selected === tab}
					title={tab.label}
					animate:flip={{ duration: tabs.selected === tab ? 100 : 100 }}
					use:scrollIntoView={tabs.selected === tab}
					use:draggableItem={{
						flipDuration: 100,
						items: tabs.tabs,
						minSwapDistance: 15,
						onDragStart() {
							tabs.selected = tab;
						}
					}}
					ondblclick={() => {
						if (!tab) return;
						Modal.instance.show({
							title: 'Rename tab',
							snippet: RenameTabModal,
							props: tab
						});
					}}
					onclick={() => {
						tabs.selected = tab;
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter') tabs.selected = tab;
					}}
				>
					<span class="px-2 text-nowrap truncate">
						{tab?.label}
					</span>
					<div
						tabindex="0"
						role="button"
						title="Close tab"
						class="absolute z-10 right-0.5 top-0.5 opacity-0 p-0.5 group-hover:opacity-100 btn-ghost btn-circle w-fit h-fit"
						onclick={tab?.onclose}
						onkeydown={(e) => {
							if (e.key === 'Enter') tab?.onclose(e);
						}}
					>
						<Fa icon={faTimes} class=" transition-opacity w-3 h-3" />
					</div>
				</div>
			{/each}
			{#if tabs.defaultAddCallback}
				<button class="tab hover btn-ghost" onclick={(e) => tabs.defaultAddCallback()}
					><Fa icon={faPlus} /></button
				>
			{/if}
			{#if tabs.additionalAddBtn}
				{@const btn = tabs.additionalAddBtn}
				<button
					class:tab-active={tabs.additionalAddPopupVisible}
					class:!bg-neutral={tabs.additionalAddPopupVisible}
					class="tab hover btn-ghost !ps-2 !pe-2"
					onfocus={() => btn.prefetch?.()}
					onpointerenter={() => btn.prefetch?.()}
					onkeydown={(e) => {
						if (e.key === 'Enter') tabs.additionalAddPopupVisible = !tabs.additionalAddPopupVisible;
					}}
					onpointerdown={(e) => (tabs.additionalAddPopupVisible = !tabs.additionalAddPopupVisible)}
					use:specialAddRef><Fa icon={faCaretDown} size="sm" /></button
				>
			{/if}
		</div>
		<div class="group relative lg:ps-[12rem] ps-[4rem] pe-4 self-stretch flex items-center z-20">
			<Fa
				icon={faEllipsisH}
				class="group-hover:opacity-0 transition-all  h-full text-4xl w-8 opacity-80"
			/>
			<nav
				class="h-full bg-base-300 pe-2 flex items-center gap-5 pointer-events-none group-hover:pointer-events-auto translate-x-20 group-hover:translate-x-0 group-focus-within:translate-x-0 absolute top-0 right-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-all"
			>
				{#snippet Link({ href, text }: { href: string; text: string })}
					<a {href} class="text-nowrap text-sm link-hover flex items-center gap-2">
						{text}
						{#if href.includes('http')}
							<Fa icon={faExternalLinkAlt} size="sm" />
						{/if}
					</a>
				{/snippet}
				{@render Link({
					href: 'https://geosx-geosx.readthedocs-hosted.com/en/latest/',
					text: 'GEOS Docs'
				})}
				{@render Link({
					href: 'https://selenite-geos.github.io/docs/advanced-interface/introduction/',
					text: 'Docs'
				})}
				{@render Link({
					href: 'https://selenite-geos.github.io/simplified-interface',
					text: 'Simplified'
				})}
				<!-- <a href="/graph-editor" class="text-nowrap">Graph Editor</a> -->
				<!-- <a href="/graph-viewer" class="text-nowrap">Graph Viewer</a> -->
				<ThemeSelector class="select-sm" />
			</nav>
		</div>
	</header>
	<main class="overflow-hidden">
		{@render children()}
	</main>
</div>

<NotificationsComponent />
<ContextMenuComponent />
<ModalComponent />
