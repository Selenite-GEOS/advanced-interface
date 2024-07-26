<script lang="ts">
  import { getContext } from "$lib/global";
  import type { SaveData } from "@selenite/commons";
  import {
    type NodeEditor,
    NodeFactory,
    setupFullGraphEditor,
    setupSvelteRender,
    themeControl,
    xmlNodeItems,
  } from "@selenite/graph-editor";
  let container = $state<HTMLElement>();

  type Props = {
    editor?: NodeEditor;
    factory?: NodeFactory;
    saveData?: SaveData<NodeEditor>;
    class?: string;
  };
  let {
    saveData,
    editor = $bindable(),
    factory = $bindable(),
    class: classes,
  }: Props = $props();

  const geosContext = getContext('geos');
  $effect(() => {
    if (!container || !geosContext.schema) return;
    setup();

    return () => {
      factory?.destroyArea();
      editor = undefined;
      factory = undefined;
    };
  });
  async function setup() {
    const schema = geosContext.schema;
    if (!schema) {
      throw new Error("Missing schema for editor setup.");
    };
    const res = await setupFullGraphEditor({
      container,
      additionalNodeItems: [
        ...xmlNodeItems({schema, basePath: ['GEOS']})
      ],
      saveData,
      setups: [setupSvelteRender],
    });
    setTimeout(() => {
      editor = res.editor;
      factory = res.factory;
    }, 10);
  }

  // Gridline updates
  $effect(() => {
    themeControl.isLight;
    editor?.area?.emit({ type: "gridline-update" });
  });
</script>

<section
  bind:this={container}
  class="transition-opacity duration-200 {classes}"
  class:!opacity-0={factory === undefined}
></section>
