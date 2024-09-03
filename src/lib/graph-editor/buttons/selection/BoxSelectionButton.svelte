<script>
	import EditorButton from '$lib/graph-editor/EditorButton.svelte';
</script>

<EditorButton
	label="Box Selection"
	description="Select elements by drawing a box around them."
	activeFactoryAction={async (factory) => {
		// factory.startBoxSelection();
	}}
>
	{#snippet icon()}
		<div class="border-base-content w-4 h-4 border-dashed border-[0.12rem] border-opacity-90"></div>
	{/snippet}
</EditorButton>
