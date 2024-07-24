<script lang="ts">
  import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";


  import EditorButton from "../EditorButton.svelte";
  import { getContext } from "$lib/global";
  import { readable, type Readable } from "svelte/store";
    const context = getContext('editor');
  const factory = $derived(context.activeFactory);
  const canUndo: Readable<boolean> = $derived(factory ? factory.history.canUndo : readable(false) );
</script>
<EditorButton label="Undo" icon={faRotateLeft} class=" hover:btn-warning  text-warning {$canUndo ? '' : '!bg-transparent'}" 
    disabled={!$canUndo}
    activeFactoryAction={(factory) => {
        factory.history.undo();
    }}
 />