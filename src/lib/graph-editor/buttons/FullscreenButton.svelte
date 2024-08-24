<script lang="ts">
	import { faMaximize, faCompress } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from '../EditorButton.svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { isTauri } from '@tauri-apps/api/core';
	import { notifications } from '@selenite/graph-editor';
	let fullscreen = $state(false);

	function onFullscreenChange() {
		console.debug('Fullscreen change', document.fullscreenElement);
		fullscreen = !!document.fullscreenElement;
	}

	function preventF11(e: KeyboardEvent) {
		if (e.key === 'F11') {
			console.log('Preventing F11');
			notifications.warn({message: 'F11 has been disabled for fullscreen, use F10 or Alt+Enter instead.', title: 'Fullscreen'});
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}
	$effect(() => {
		if (!isTauri()) {
			document.addEventListener('keydown', preventF11);
			window.addEventListener('keydown', preventF11);
			document.addEventListener('fullscreenchange', onFullscreenChange);
			return () => {
				document.removeEventListener('fullscreenchange', onFullscreenChange);
				document.removeEventListener('keydown', preventF11);
				window.removeEventListener('keydown', preventF11);
			};
		}
	});
</script>

<EditorButton
	label="Fullscreen"
	description={`${fullscreen ? 'Leave' : 'Enter'} full screen mode.`}
	shortcut={['f10', 'alt+enter']}
	icon={fullscreen ? faCompress : faMaximize}
	onclick={async (e) => {
		e.preventDefault();
		if (isTauri()) {
			fullscreen = !fullscreen;
			getCurrentWindow().setFullscreen(fullscreen);
		} else {
			window.focus();
			if (document.fullscreenElement === null) {
				try {
				await document.documentElement.requestFullscreen();
				} catch (e) {
					notifications.warn({message: "Can't enter fullscreen right now, try interacting with the page first.", title: 'Fullscreen'})
				}
			} else {
				await document.exitFullscreen();
			}
		}
	}}
/>
