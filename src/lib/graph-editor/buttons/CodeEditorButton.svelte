<script>
  import EditorButton from "../EditorButton.svelte";
  import { faFileCode } from "@fortawesome/free-solid-svg-icons";
  import { getContext } from "$lib/global";

  const editorContext = getContext('editor');

</script>
<EditorButton label="Code Editor" icon={faFileCode} class="" activeFactoryAction={(factory) => {
    editorContext.displayCodeEditor = !editorContext.displayCodeEditor
}}/>