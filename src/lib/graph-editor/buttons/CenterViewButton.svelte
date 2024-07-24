<script>
  import { faArrowsToEye } from "@fortawesome/free-solid-svg-icons";
  import EditorButton from "../EditorButton.svelte";
</script>

<EditorButton label="Center View" icon={faArrowsToEye} class="" activeFactoryAction={(factory) => {
    factory.centerView();
}}/>
