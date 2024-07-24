<script lang="ts">
  import { faCube, faCubes, faCubesStacked, faPlus } from "@fortawesome/free-solid-svg-icons";
  import EditorButton from "../EditorButton.svelte";
  import { type NodeFactory, notifications } from "@selenite/graph-editor";
  import Fa, { FaLayers } from "svelte-fa";


    function createMacroBlock(factory: NodeFactory) {
        notifications.warn({
            message:"Create macro block not yet implemented."
        })
    }
</script>

<EditorButton activeFactoryAction={createMacroBlock}>
    {#snippet icon()}
        <FaLayers>
            <Fa icon={faCube} translateX={-0.3} translateY={0.2} />
            <Fa icon={faPlus} translateX={0.7} translateY={-0.5} size={"sm"}/>
        </FaLayers>
    {/snippet}
</EditorButton>