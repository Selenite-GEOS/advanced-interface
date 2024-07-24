<script lang="ts">
  import { faRotateRight } from "@fortawesome/free-solid-svg-icons";


  import { getContext } from "$lib/global";
  import { readable } from "svelte/store";
  import type { Readable } from "svelte/store";
  import SmallEditorButton from "../SmallEditorButton.svelte";

  const context = getContext('editor');
  const factory = $derived(context.activeFactory);
  const canRedo: Readable<boolean> = $derived(factory ? factory.history.canRedo : readable(false) );
</script>
<SmallEditorButton label="Redo" icon={faRotateRight} class="hover:btn-success text-success {$canRedo ? '' : '!bg-transparent'}" 
    disabled={!$canRedo}
    activeFactoryAction={(factory) => {
        factory.history.redo();
    }}
 />