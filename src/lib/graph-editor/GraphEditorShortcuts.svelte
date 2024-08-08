<script lang="ts">
	import { getContext } from '$lib/global';
	import { shortcut } from '@selenite/commons';
	import { contextMenu } from '@selenite/graph-editor';
	const editorContext = getContext('editor');
</script>

<div
	hidden
	use:shortcut={{
		key: 'a',
		ctrl: true,
		action() {
			if (contextMenu.visible) return;
			editorContext.activeFactory?.selectAll();
		}
	}}
	use:shortcut={{
		key: 'delete',
		action() {
			if (contextMenu.visible) return;
			editorContext.activeFactory?.deleteSelectedElements();
		}
	}}
	use:shortcut={{
		key: 'escape',
		action() {
			if (contextMenu.visible) return;
			editorContext.activeFactory?.unselectAll();
		}
	}}
></div>
