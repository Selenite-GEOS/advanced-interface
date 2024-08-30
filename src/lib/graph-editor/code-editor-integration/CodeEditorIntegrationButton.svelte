<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import { clickIfNoDrag } from '@selenite/commons';
	import Fa from 'svelte-fa';

	interface Props {
		icon: IconDefinition;
		flip?: 'horizontal' | 'vertical' | 'both';
		onclick?: () => void;
	}
	
	let {icon, flip, onclick}: Props = $props();	
</script>

<button class="btn btn-icon-sm variant-filled-primary pointer-events-auto" use:clickIfNoDrag={{onclick}}>
	<Fa {icon} {flip} />
</button>
