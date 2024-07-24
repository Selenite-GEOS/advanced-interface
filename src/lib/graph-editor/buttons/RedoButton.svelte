<script lang="ts">
  import { faRotateRight } from "@fortawesome/free-solid-svg-icons";


  import EditorButton from "../EditorButton.svelte";
  import { getContext } from "$lib/global";
  import { get, readable } from "svelte/store";
  import type { Readable } from "svelte/store";

  const context = getContext('editor');
  const factory = $derived(context.activeFactory);
  const canRedo: Readable<boolean> = $derived(factory ? factory.history.canRedo : readable(false) );
</script>
<EditorButton label="Redo" icon={faRotateRight} class="hover:btn-success text-success {$canRedo ? '' : '!bg-transparent'}" 
    disabled={!$canRedo}
    activeFactoryAction={(factory) => {
        factory.history.redo();
    }}
 />