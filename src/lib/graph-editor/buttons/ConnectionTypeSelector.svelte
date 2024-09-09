<script lang="ts">
	import { getContext, persisted } from '$lib/global';
	import { Button } from '@selenite/commons';
	import type { ConnectionPathType } from '@selenite/graph-editor';
	import { line } from 'd3-shape';
	import { assignConnectionPath, connectionPathTypes, themeControl } from '@selenite/graph-editor';
	import { slide } from 'svelte/transition';

	interface Props {
		size?: number;
	}

	let { size = 12 }: Props = $props();
	const editorContext = getContext('editor');
	const connectionPathType = persisted<ConnectionPathType>(
		'connectionPathType',
		connectionPathTypes[0]
	);
	let alwaysVisible = false;

	function getPath(type: ConnectionPathType) {
		return line()
			.x((d) => size * d[0])
			.y((d) => size * d[1])
			.curve(assignConnectionPath(type))([
			[0, 0],
			[0.33, 0],
			[0.66, 1],
			[1, 1]
		]);
	}
	$effect(() => {
		for (const f of editorContext.factories) f.connectionPathType.set($connectionPathType);
	});
	let hovered = $state(false);
    let buttonsReady = $state(false)
    let timeout: NodeJS.Timeout | undefined
    $effect(() => {
        if (hovered)
            timeout = setTimeout(() => buttonsReady = true, 200)
        else {
            buttonsReady = false
            if (timeout) clearTimeout(timeout)
        }
    })
</script>

{#snippet path(type: ConnectionPathType, alwaysVisible: boolean = false)}
    <svg
					class=" {alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}"
					class:opacity-50={$connectionPathType !== type}
					width={size}
					height={size}
				>
					<path d={getPath(type)} fill="none"/>
				</svg>
{/snippet}

<div class="hover:bg-base-300 hover:border hover:border-base-content relative group min-w-8 h-8 rounded-full pointer-events-auto" style="border-color: oklch(var(--btn-color, var(--b2)) / var(--tw-border-opacity));" onpointerover={() => (hovered = true)} onpointerleave={() => hovered = false}>
	{#if hovered}
    <div class="flex" transition:slide={{axis: 'x', duration: 200}}>
		{#each connectionPathTypes as type}
			<Button class="btn-sm btn-circle btn-ghost {type !== $connectionPathType ?  'stroke-base-content' : `${themeControl.isLight ? 'stroke-neutral-content' : 'stroke-accent'} bg-neutral hover:bg-neutral`} {buttonsReady ? 'pointer-events-auto' : 'pointer-events-none'} !transition-none" onclick={() => ($connectionPathType = type)}>
				{@render path(type)}
			</Button>
		{/each}
        </div>
	{:else}
        <div class="absolute bg-opacity-50 inset-0 btn btn-sm btn-circle border  stroke-base-content !transition-none z-10">{@render path($connectionPathType, true)}</div>
    {/if}
</div>

<!-- <div class="fill-token px-2 absolute right-0 flex" style="height: {size}; width: {size};">
				<RadioGroup
					background="me-1.5 group relative variant-ghost-surface pointer-events-auto overflow-hidden d-opacity-50 transition-all  {alwaysVisible
						? 'w-full'
						: 'w-7 hover:w-28'}  hover:opacity-100"
					active="opacity-100"
					border="outline-2"
					fill="red"
				>
					{#if !alwaysVisible}
						<div
							class="transition-all absolute right-0 py-1 group-hover:opacity-0"
							style="padding-right: 0.5rem;"
						>
							<svg width={size} height={size}>
								<path d={getPath($connectionPathType)} {stroke} fill="none" />
							</svg>
						</div>
					{/if}
					{#each connectionPathTypes as type}
						<RadioItem
							name="connectionPathType"
							padding="p-1"
							bind:group={$connectionPathType}
							value={type}
						>
							<svg
								class={alwaysVisible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
								class:group-hover:opacity-50={$connectionPathType !== type}
								width={size}
								height={size}
							>
								<path d={getPath(type)} {stroke} fill="none" />
							</svg>
						</RadioItem>
					{/each}
				</RadioGroup>
			</div> -->
