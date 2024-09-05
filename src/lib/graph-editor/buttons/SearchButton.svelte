<script lang="ts">
	import { faArrowLeft, faArrowRight, faMagnifyingGlass, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { createFloatingActions } from 'svelte-floating-ui';
	import { offset, shift } from 'svelte-floating-ui/core';
	import { getContext } from '$lib/global';
	import type { Action } from 'svelte/action';
	import { untrack } from 'svelte';
	import Fa from 'svelte-fa';
	import { shortcut } from '@selenite/commons';

	const [searchRef, searchPopup] = createFloatingActions({
        middleware: [offset(8), shift({mainAxis: true, crossAxis: true})]
    });
    const editorContext = getContext('editor');
    const factory = $derived(editorContext.activeFactory)

    $effect(() => {
        if (!factory || !search) return;
        untrack(() => {
            factory.search.query = q;
        })
        return () => {
            factory.search.query = '';
        }
    })
    
    let q = $state('');
    let search = $state(false);
    const focus: Action = (node) => node.focus();

    function hideSearch() {
        search = false;
        for (const f of editorContext.factories ?? []) {
            f.search.query = '';
            f.search.focused = undefined;
        }
    }

    function showSearch() {
        search = true;
        for (const f of editorContext.factories ?? []) {
            f.search.query = q;
        }
    }
</script>

{#if search}
<aside use:searchPopup class="flex flex-col gap-2 bg-base-200 p-4 rounded-box border border-base-content border-opacity-10" use:shortcut={{key:'escape', ignoreElements:[],  action: () => {
    hideSearch()
}}}>
    <input class="input input-bordered input-secondary pointer-events-auto mb-2" bind:value={q} use:focus placeholder="Search" oninput={(e) => {
        if (!factory) return;
        factory.search.query = e.currentTarget.value;
    }} onkeydown={(e) => {
        if (e.key === 'Enter') {
            if (!factory) return;
            factory.search.next();
            return;
        }
    }}/>
    {#snippet button(icon: IconDefinition, onclick: () => void, class_?: string)}
    <button class="btn btn-sm pointer-events-auto btn-secondary {class_}" {onclick}><Fa {icon}/></button>
    {/snippet}
    {@render button(faArrowRight, () => {
        if (!factory) return;
        factory.search.next();
    }, "dbtn-primary")}
    {@render button(faArrowLeft, () => {
        if (!factory) return;
        factory.search.previous();
    }, "dbtn-primary")}
</aside>
{/if}

<div use:searchRef>
	<EditorButton
        shortcutInInput={true}
		label="Search"
        shortcut="ctrl+f"
		description="Search in the graph."
		icon={faMagnifyingGlass}
		onclick={() => {
            if (search) 
                hideSearch();
            else
                showSearch();
        }}
	/>
</div>
