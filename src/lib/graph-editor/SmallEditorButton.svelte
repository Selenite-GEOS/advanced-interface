<script lang="ts">
  import type { ComponentProps } from "svelte";
  import EditorButton from "./EditorButton.svelte";


  let {...props}: ComponentProps<EditorButton> = $props()

</script>
<EditorButton  {...props} class="btn-sm {props.class}"/>