<script lang="ts">
  import { persisted, setContext, Tabs, type Tab, type Contexts } from '$lib';
  import { horizontalScroll, shortcut, type SaveData } from '@selenite/commons';
  import {notifications, NotificationsComponent, ContextMenuComponent, ModalComponent, Modal} from '@selenite/graph-editor'
    import '../app.css'
    import {faEllipsisH, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons'
    import Fa from 'svelte-fa'
  import ThemeSelector from '$lib/ThemeSelector.svelte';
  import { slide } from 'svelte/transition';
  import {dndzone, type DndEvent} from 'svelte-dnd-action'
  import { untrack } from 'svelte';
    let {children} = $props()

    const tabs = new Tabs();
    setContext('tabs', tabs)
    const saveCallbacks: Contexts["saves"] = $state([])
    setContext('saves', saveCallbacks);

    function save() {
        let numErrors = 0
        for (const saveCallback of saveCallbacks) {
            try {
                saveCallback()
            } catch (e) {
                numErrors++
            }
        }
        if (numErrors === 0)
        notifications.success({message: 'Saved!', title: 'Save'})
    else 
    notifications.error({message: 'Some errors occured while saving.', title: 'Save'})
    }
</script>

{#snippet RenameTabModal(tab: Tab)}
<input bind:value={tab.label} class="input input-bordered text-base-content" />
{/snippet}

{#snippet TabSnippet({tab}: {tab?: Tab})}
    <div 
    tabindex="0" in:slide={{}} role="tab" class="tab !cursor-pointer relative group min-w-[6rem]" class:tab-active={tabs.selected === tab} 
    ondblclick={() => {
        if (!tab) return;
        Modal.instance.show({
            title: 'Rename tab',
            snippet: RenameTabModal,
            props: tab
        })
    }}
    onclick={() => {
        if (!tab) return;
        tabs.selected = tab
    }}
    onkeydown={(e) => {
            if (e.key === 'Enter')
                tabs.selected = tab
            }}
    >
        <span class="px-2 text-nowrap">
        {tab?.label}
        </span>
        <div tabindex="0" role="button" class="absolute z-10 right-0.5 top-0.5 opacity-0 p-0.5  group-hover:opacity-100 btn-ghost btn-circle w-fit h-fit" 
        onclick={tab?.onclose}
         onkeydown={(e) => {
            if (e.key === 'Enter')
                tab?.onclose(e)
            }}>
        <Fa icon={faTimes}  class=" transition-opacity w-3 h-3"/>
        </div>
    </div>
{/snippet}

<div class="grid grid-rows-[0fr,1fr] h-screen w-screen overflow-hidden" 
use:shortcut={{key: 's', ctrl: true, action: save}}
use:shortcut={{
    shortcuts(e) {
        // Tabs shortcuts
        const pos = parseInt(e.key)
        if (!isNaN(pos)) {
            tabs.selectNth(pos === 0 ? -1 : pos - 1)
            return true;
        }
        const chars = `&é"'(-è_çà`
        const index = chars.indexOf(e.key)
        if (index !== -1) {
            tabs.selectNth(index === chars.length - 1 ? -1 : index);
            return true;
        }
    return false;
}}}
>
<header class="grid grid-cols-[0fr,1fr,0fr] items-center bg-base-300 gap-4 relative h-12">
    <h1 class="text-xl font-bold ms-4">GEOS</h1>
    
    <div role="tablist"   use:horizontalScroll class="tabs tabs-lifted grow justify-start self-stretch w-full overflow-hidden hover:overflow-x-auto scrollbar-thin">
        {#each tabs as tab (tab.id)}
            {@render TabSnippet({tab: tabs.get(tab.id)!})}
        {/each}
        <button class="tab hover btn-ghost" onclick={(e) => tabs.defaultAddCallback()} ><Fa icon={faPlus}/></button>
    </div>
    <div class="group relative lg:ps-[12rem] ps-[4rem] pe-4 self-stretch flex items-center">
        <Fa icon={faEllipsisH} size="2x" class="group-hover:opacity-0 transition-all  h-full" />
        <nav class="bg-base-300 flex gap-2 pointer-events-none group-hover:pointer-events-auto absolute top-0 right-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-all">
            <a href="/graph-editor">Graph Editor</a>
            <a href="/graph-viewer">Graph Viewer</a>
            <ThemeSelector />
        </nav>
    </div>
</header>
<main>
{@render children()}
</main>
</div>

<NotificationsComponent />
<ContextMenuComponent />
<ModalComponent />