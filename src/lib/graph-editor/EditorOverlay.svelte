<script lang="ts">
	import { MiniMap, VariablesListComponent } from '@selenite/graph-editor';
	import ArrangeButton from './buttons/ArrangeButton.svelte';
	import CenterViewButton from './buttons/CenterViewButton.svelte';
	import ClearButton from './buttons/ClearButton.svelte';
	import CodeEditorButton from './buttons/CodeEditorButton.svelte';
	import CreateMacroBlock from './buttons/CreateMacroBlock.svelte';
	import DownloadButton from './buttons/DownloadButton.svelte';
	import FullscreenButton from './buttons/FullscreenButton.svelte';
	import GridButton from './buttons/GridButton.svelte';
	import LoadButton from './buttons/LoadButton.svelte';
	import RedoButton from './buttons/RedoButton.svelte';
	import SaveButton from './buttons/SaveButton.svelte';
	import UndoButton from './buttons/UndoButton.svelte';
	import Toolbar from './Toolbar.svelte';
	import SearchButton from './buttons/SearchButton.svelte';
	import BoxSelectionButton from './buttons/selection/BoxSelectionButton.svelte';
	import InvertSelectionButton from './buttons/selection/InvertSelectionButton.svelte';
	import MinimapButton from './buttons/MinimapButton.svelte';
	import ConnectionTypeSelector from './buttons/ConnectionTypeSelector.svelte';

	type Props = {
		class?: string;
	};
	let { class: classes = '' }: Props = $props();
</script>

<div class="{classes} pointer-events-none grid grid-cols-2 grid-rows-2 p-2 gap-2">
	<!-- Top left -->
	<div class="grid gap-2 justify-start place-content-start">
		<Toolbar class="justify-start">
			<SaveButton />
			<LoadButton />
			<DownloadButton />
			<CreateMacroBlock />
			<ClearButton />
		</Toolbar>
		<Toolbar class="justify-start ms-2">
			<UndoButton />
			<RedoButton />
		</Toolbar>
	</div>
	<div class="grid justify-end place-content-start gap-2">
		<Toolbar class="justify-end">
			<ArrangeButton />
			<CenterViewButton />
			<FullscreenButton />
			<CodeEditorButton />
		</Toolbar>
		<Toolbar class="justify-end">
			<SearchButton />
			<BoxSelectionButton />
			<InvertSelectionButton />
		</Toolbar>
		<Toolbar class="justify-end me-2">
			<ConnectionTypeSelector />
			<GridButton />
			<MinimapButton />
		</Toolbar>
	</div>
	<div class="flex items-end">
		<VariablesListComponent />
	</div>
	<div class="flex justify-end items-end">
		<!-- <EditorButton /> -->
		<MiniMap />
	</div>
</div>
