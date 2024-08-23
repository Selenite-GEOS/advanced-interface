<script>
	import { faMaximize, faCompress } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { isTauri } from '@tauri-apps/api/core';
	let fullscreen = $state(false);
</script>

<EditorButton
	label="Fullscreen"
	description={`${fullscreen ? 'Leave' : 'Enter'} full screen mode.`}
	shortcut="f11"
	icon={fullscreen ? faCompress : faMaximize}
	onclick={() => {
		if (document.fullscreenElement) {
			fullscreen = false;
			if (isTauri()) {
				getCurrentWindow().setFullscreen(false);
			} else {
				document.exitFullscreen();
			}
		} else {
			fullscreen = true;
			if (isTauri()) {
				getCurrentWindow().setFullscreen(true);
			} else {
				document.documentElement.requestFullscreen();
			}
		}
	}}
/>
