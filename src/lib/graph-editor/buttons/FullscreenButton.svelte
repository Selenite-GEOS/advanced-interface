<script>
	import { faMaximize, faCompress } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { isTauri } from '@tauri-apps/api/core';
	import { sleep } from '@selenite/commons';
	let fullscreen = $state(false);

	function onFullscreenChange() {
		console.debug("Fullscreen change", document.fullscreenElement);
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
			window.focus();
			if (document.fullscreenElement === null) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
			fullscreen = document.fullscreenElement !== null;
		}
	}}
/>
