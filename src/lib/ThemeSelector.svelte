<script lang="ts">
  import { capitalize, shortcut } from "@selenite/commons";
  import { themeControl } from "@selenite/graph-editor";
</script>

<select
  class="select select-bordered text-base-content"
  title="Theme"
  bind:value={themeControl.theme}
  use:shortcut={{ key: "t", action: () => themeControl.theme = themeControl.nextTheme }}
  use:shortcut={{ key: "r",  action: () => themeControl.theme = themeControl.previousTheme }}
>
  <option value="">Default</option>
  {#each themeControl.themes as theme}
    <option value={theme}>{capitalize(theme)}</option>
  {/each}
</select>
