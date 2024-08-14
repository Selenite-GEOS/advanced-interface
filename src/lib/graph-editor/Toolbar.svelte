<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import type { HTMLBaseAttributes, HTMLAttributes } from 'svelte/elements';

	let { children, ...props }: { children?: Snippet } & HTMLAttributes<HTMLDivElement> = $props();

	/**
	 * @param node
	 */
	const gridBreakpoints: Action<HTMLElement> = (node) => {
		node.classList.add('grid', 'grid-flow-col');
		let childCount = node.childElementCount;

		const observer = new MutationObserver((records) => {
			childCount = node.childElementCount;
			updateGridStyles();
		});
		observer.observe(node, { childList: true });

		window.addEventListener('resize', updateGridStyles);

		updateGridStyles();
		function updateGridStyles() {
			if (window.innerWidth > 640) {
				node.style.gridTemplateRows = '';
				return;
			}
			node.style.gridTemplateRows = `repeat(${childCount}, minmax(0, 1fr))`;
		}
		return {
			destroy() {
				observer.disconnect();
				window.removeEventListener('resize', updateGridStyles);
			}
		};
	};
</script>

<div {...props} class="flex flex-wrap items-center gap-2 {props.class}">
	{#if children}
		{@render children()}
	{/if}
</div>
