<script lang="ts">
  import type { SaveData } from "@selenite/commons";
  import { type NodeEditor, NodeFactory, setupFullGraphEditor, setupSvelteRender, themeControl } from "@selenite/graph-editor";
  import { tick } from "svelte";
  let container = $state<HTMLElement>();

  type Props = {
    editor?: NodeEditor
    factory?: NodeFactory
    saveData?: SaveData<NodeEditor>
    class?: string
  };
  let {saveData, editor = $bindable(), factory = $bindable(), class: classes}: Props = $props();
  
  console.log("saveData", saveData)
  $effect(() => {
    if (!container) return;
    setup()

    return () => {
        factory?.destroyArea();
        editor = undefined
        factory = undefined
    }
  });
  async function setup() {
    const res = await setupFullGraphEditor({ container,saveData, setups: [setupSvelteRender] });
    setTimeout(() => {
      editor = res.editor;
    factory = res.factory;
    }, 10)
    
  }

  // Gridline updates
  $effect(() => {
		themeControl.isLight;
		editor?.area?.emit({ type: 'gridline-update' });
	});
</script>

<section bind:this={container} class="transition-opacity duration-200 {classes}" class:!opacity-0={factory===undefined}>
</section>
