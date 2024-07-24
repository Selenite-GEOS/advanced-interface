<script>
  import { faFile, faUpload } from "@fortawesome/free-solid-svg-icons";
  import EditorButton from "../EditorButton.svelte";
</script>

<EditorButton label="Load" icon={faFile} class="" activeFactoryAction={(factory) => {
    factory.loadFromFile();
}}/>
