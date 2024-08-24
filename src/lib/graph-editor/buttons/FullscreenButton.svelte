<script>
	import { faMaximize, faCompress } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { isTauri } from '@tauri-apps/api/core';
	import { notifications } from '@selenite/graph-editor';
	let fullscreen = $state(false);

	function onFullscreenChange() {
		fullscreen = document.fullscreenElement !== null;
	}

	$effect(() => {
		window.addEventListener('fullscreenchange', onFullscreenChange);

		return () => {
			window.removeEventListener('fullscreenchange', onFullscreenChange);
		};
	})
</script>

<EditorButton
	label="Fullscreen"
	description={`${fullscreen ? 'Leave' : 'Enter'} full screen mode.`}
	shortcut="f11"
	icon={fullscreen ? faCompress : faMaximize}
	onclick={async () => {
		if (fullscreen) {
			fullscreen = false;
			if (isTauri()) {
				notifications.show({message: JSON.stringify(await getCurrentWindow().setFullscreen(false))});
			} else {
				document.exitFullscreen();
			}
		} else {
			fullscreen = true;
			if (isTauri()) {
				notifications.show({message: JSON.stringify(await getCurrentWindow().setFullscreen(true))});
			} else {
				document.documentElement.requestFullscreen();
			}
		}
	}}
/>
