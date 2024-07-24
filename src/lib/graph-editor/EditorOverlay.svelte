<script lang="ts">
  import CenterViewButton from "./buttons/CenterViewButton.svelte";
import ClearButton from "./buttons/ClearButton.svelte";
  import CodeEditorButton from "./buttons/CodeEditorButton.svelte";
  import CreateMacroBlock from "./buttons/CreateMacroBlock.svelte";
  import DownloadButton from "./buttons/DownloadButton.svelte";
  import GridButton from "./buttons/GridButton.svelte";
  import LoadButton from "./buttons/LoadButton.svelte";
  import RedoButton from "./buttons/RedoButton.svelte";
  import SaveButton from "./buttons/SaveButton.svelte";
  import UndoButton from "./buttons/UndoButton.svelte";
  import EditorButton from "./EditorButton.svelte";
  import Toolbar from "./Toolbar.svelte";

  type Props = {
    class?: string;
  };
  let { class: classes = "" }: Props = $props();
</script>

<div
  class="{classes} pointer-events-none grid grid-cols-2 grid-rows-2 p-2 gap-2"
>
  <!-- Top left -->
  <div class="grid gap-2 justify-start place-content-start">
    <Toolbar>
      <SaveButton />
      <LoadButton />
      <DownloadButton />
      <CreateMacroBlock />
      <ClearButton />
    </Toolbar>
    <div
      class="grid grid-flow-col justify-start grid-rows-2 sm:grid-rows-1 gap-2 ms-2"
    >
      <UndoButton />
      <RedoButton />
    </div>
  </div>
  <div class="grid justify-end place-content-start gap-2">
    <Toolbar class="justify-end">
      <CenterViewButton />
      <CodeEditorButton />
    </Toolbar>
    <Toolbar class="justify-end me-2">
      <GridButton />
    </Toolbar>
  </div>
  <div class="flex items-end">
    <EditorButton />
  </div>
  <div class="flex justify-end items-end">
    <EditorButton />
  </div>
</div>
