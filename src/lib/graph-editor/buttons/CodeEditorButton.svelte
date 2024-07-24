<script>
  import { notifications } from "@selenite/graph-editor";
  import EditorButton from "../EditorButton.svelte";
  import { faFileCode } from "@fortawesome/free-solid-svg-icons";

</script>
<EditorButton label="Code Editor" icon={faFileCode} class="" activeFactoryAction={(factory) => {
    notifications.warn({ message: "Code Editor is not implemented yet"});
}}/>