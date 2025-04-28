<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import EditorButton from './EditorButton.svelte';

	let { ...props }: ComponentProps<typeof EditorButton> = $props();
</script>

<EditorButton {...props} class="btn-sm {props.class}" />
