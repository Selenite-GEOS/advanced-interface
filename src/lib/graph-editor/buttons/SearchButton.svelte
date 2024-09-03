<script>
	import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
	import EditorButton from "../EditorButton.svelte";

</script>
<EditorButton
    label="Search"
    description="Search for elements in the graph."
    icon={faMagnifyingGlass}
    activeFactoryAction={async (factory) => {
        // factory.startBoxSelection();
    }}/>