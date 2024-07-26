<script lang="ts">
  import Editor from "./graph-editor/Editor.svelte";
  import { getContext, persisted, setContext } from "$lib";
  import { newUuid, type SaveData } from "@selenite/commons";
  import type { NodeEditor, NodeFactory } from "@selenite/graph-editor";
  import { SvelteSet } from "svelte/reactivity";
  import EditorOverlay from "./graph-editor/EditorOverlay.svelte";
  import GraphBrowser from "./GraphBrowser.svelte";
  import CodeEditorIntegration from "./graph-editor/code-editor-integration/CodeEditorIntegration.svelte";
  const tabs = getContext("tabs");
  tabs.defaultAddCallback = addEditor;

  const savedGraphs = persisted<Record<string, SaveData<NodeEditor>>>(
    "saved-graphs",
    {}
  );
  const savedSelectedId = persisted<string | undefined>(
    "selected-graph",
    undefined
  );
  const initialGraphs = $savedGraphs;
  let factories = $state<Record<string, NodeFactory | undefined>>({});
  const deleted = new SvelteSet();

  function addEditor(id?: string) {
    if (id === undefined) id = newUuid("graph-editor");
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
        if (editor) editor.graphName = s;
      },
    });
  }

  // Load save
  for (const id in $savedGraphs) {
    addEditor(id);
  }
  if ($savedSelectedId) tabs.select($savedSelectedId);

  // Add an editor if there are none
  $effect(() => {
    if (tabs.length === 0) {
      addEditor();
    }
  });
  /** Saves graphs. */
  function save() {
    console.log("Save editors.");
    $savedSelectedId = tabs.selected?.id;
    const res: Record<string, SaveData<NodeEditor>> = {};
    for (const {id} of tabs) {
      if (factories[id]) {
        res[id] = factories[id].editor.toJSON();
      }
    }
    $savedGraphs = res;
    console.debug("Saved graphs", $savedGraphs);
  }

  const saves = getContext("saves");
  saves.add(save);

  let displayCodeEditor = persisted("display-code-editor", false);
  setContext("editor", {
    get activeFactory() {
      return factories[tabs.selected?.id ?? ""];
    },
    get factories() {
      return Object.values(factories).filter((f) => f !== undefined);
    },
    get displayCodeEditor() {
      return $displayCodeEditor;
    },
    set displayCodeEditor(value: boolean) {
      $displayCodeEditor = value;
    },
  });
</script>

<div class="h-full w-full grid grid-cols-[0fr,1fr,0fr]">
  <!-- Left side bar -->
  <aside class="h-full bg-base-200">
    <GraphBrowser />
  </aside>
  <div class="h-full relative">
    <EditorOverlay class="absolute top-0 z-10 w-full h-full" />
    {#each Object.keys(factories) as id (id)}
      {#if !deleted.has(id)}
        <Editor
          bind:factory={factories[id]}
          saveData={initialGraphs[id]}
          class="absolute inset-0 {id === tabs.selected?.id
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none -z-50'}"
        />
      {/if}
    {/each}
  </div>
  <aside class="h-full">
    {#if $displayCodeEditor}
    <CodeEditorIntegration />
    {/if}
  </aside>
</div>
