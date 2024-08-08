<script>
	import { faEraser } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
</script>

<EditorButton
	label="Clear"
	class=""
	icon={faEraser}
	activeFactoryAction={async (factory) => {
		if (factory.selector.entities.size > 0) {
			factory.deleteSelectedElements();
			return;
		}
		factory.clear();
	}}
/>
