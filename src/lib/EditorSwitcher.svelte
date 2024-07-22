<script lang="ts">
  import Editor from "./Editor.svelte";
  import { getContext, persisted } from "$lib";
  import { newUuid, type SaveData } from "@selenite/commons";
  import type { NodeEditor, NodeFactory } from "@selenite/graph-editor";
  import { SvelteSet } from "svelte/reactivity";

  const tabs = getContext("tabs");
  tabs.defaultAddCallback = addEditor;

  const savedGraphs  = persisted<Record<string, SaveData<NodeEditor>>>('saved-graphs', {})
  const savedSelectedId = persisted<string | undefined>('selected-graph', undefined)
  const initialGraphs = $savedGraphs
  let factories = $state<Record<string, NodeFactory | undefined>>({});
  const deleted = new SvelteSet();

  function addEditor(id?: string) {
    if (id === undefined)
        id = newUuid("graph-editor");
    factories[id] = undefined;
    tabs.add({
      id,
      onclose(e) {
        deleted.add(id);
        delete factories[id];
      },
      get label() {
        return factories[id]?.editor.graphName ?? "Loading...";
      },
      set label(s: string) {
        console.log("setting label", s);
        const editor = factories[id]?.editor;
        if (editor)
          editor.graphName = s;
      },
    });
  }

  // Load save
  for (const id in $savedGraphs) {
    addEditor(id)
  }
  if ($savedSelectedId) tabs.select($savedSelectedId)

  // Add an editor if there are none
  $effect(() => {
    if (tabs.length === 0) {
      addEditor();
    }
  })

  /** Saves graphs. */
  function save() {
    console.log("Save editors.")
    $savedSelectedId = tabs.selected?.id;
    const res: Record<string, SaveData<NodeEditor>> = {}
    for (const id in factories) {
      if (factories[id]) {
        res[id] = factories[id].editor.toJSON();
      }
    }
    $savedGraphs = res;
    console.debug("Saved graphs", $savedGraphs)
  }

  const saves = getContext('saves')
  saves.push(save);
</script>

<div class="h-full w-full relative">
  {#each Object.keys(factories) as id (id)}
    {#if !deleted.has(id)}
      <Editor bind:factory={factories[id]} saveData={initialGraphs[id]} class="absolute inset-0 {id === tabs.selected?.id ? "opacity-100" : "opacity-0 pointer-events-none"}"/>
    {/if}
  {/each}
</div>
