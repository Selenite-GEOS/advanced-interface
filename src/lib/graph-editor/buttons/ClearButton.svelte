<script>
  import { faEraser } from "@fortawesome/free-solid-svg-icons";
  import EditorButton from "../EditorButton.svelte";
</script>

<EditorButton label="Clear" class="" icon={faEraser} activeFactoryAction={async (factory) => {
    factory.clear();
}}/>
