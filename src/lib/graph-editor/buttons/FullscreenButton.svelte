<script>
	import { faMaximize, faCompress } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { isTauri } from '@tauri-apps/api/core';
	let fullscreen = $state(false);

	function onFullscreenChange() {
		console.log("Fullscreen change", document.fullscreenElement);
		fullscreen = !!document.fullscreenElement;
	}

	$effect(() => {
		if (!isTauri()) {
		document.addEventListener('fullscreenchange', onFullscreenChange);
		return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
		}
	})

	// $effect(() => {
	// 	document.addEventListener('fullscreenchange', onFullscreenChange);
	// 	return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
	// });
</script>

<EditorButton
	label="Fullscreen"
	description={`${fullscreen ? 'Leave' : 'Enter'} full screen mode.`}
	shortcut="f11"
	icon={fullscreen ? faCompress : faMaximize}
	onclick={async (e) => {
		e.preventDefault();
		if (isTauri()) {
			fullscreen = !fullscreen;
			getCurrentWindow().setFullscreen(fullscreen);
		} else {
			fullscreen = document.fullscreenElement === null;
			if (fullscreen) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		}
	}}
/>
