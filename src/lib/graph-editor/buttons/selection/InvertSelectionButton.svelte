<script>
	import EditorButton from '$lib/graph-editor/EditorButton.svelte';
</script>

<EditorButton
	label="Invert Selection"
	description="Invert the selection."
    shortcut="i"
	activeFactoryAction={async (factory) => {
		factory.selector.invertSelection();
	}}
>
	{#snippet icon()}
		<svg
			viewBox="0 0 200 200"
            class="w-2/5"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g>
				<path
					id="rect1"
					fill="currentColor"
					d="M 62.157446,24.928194 C 42.118899,26.227243 26.227243,42.118899 24.928194,62.157446 v 75.684784 c 1.299049,20.03855 17.190705,35.93072 37.229252,37.22977 h 75.684784 c 20.03855,-1.29905 35.93072,-17.19122 37.22977,-37.22977 V 62.157446 C 173.77295,42.118899 157.88078,26.227243 137.84223,24.928194 Z m 78.885074,34.723857 c 6.16302,4.703642 8.68226,7.26424 8.61874,14.496379 l -0.62012,70.59946 c -0.0243,2.7699 -2.22969,5.00325 -4.99969,5.00021 L 79.719427,149.6776 C 69.341585,149.6662 69.041612,148.31397 63.314144,142.14578 92.789135,113.92508 112.93536,89.210579 141.04252,59.652011 Z"
				/>
			</g>
		</svg>
	{/snippet}
</EditorButton>
