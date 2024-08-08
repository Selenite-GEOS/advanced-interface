export {};
// export const themes = [
//   "light",
//   "dark",
//   "cupcake",
//   "bumblebee",
//   "emerald",
//   "corporate",
//   "synthwave",
//   "retro",
//   "cyberpunk",
//   "valentine",
//   "halloween",
//   "garden",
//   "forest",
//   "aqua",
//   "lofi",
//   "pastel",
//   "fantasy",
//   "wireframe",
//   "black",
//   "luxury",
//   "dracula",
//   "cmyk",
//   "autumn",
//   "business",
//   "acid",
//   "lemonade",
//   "night",
//   "coffee",
//   "winter",
//   "dim",
//   "nord",
//   "sunset",
// ] as const;

// export const darkThemes = [
//   "dark",
//   "synthwave",
//   "halloween",
//   "forest",
//   "black",
//   "luxury",
//   "dracula",
//   "business",
//   "night",
//   "coffee",
//   "dim",
//   "sunset",
// ] as (typeof themes)[number][];
// class ThemeControl {
//   get theme() {
//     return this.themes[this.#themeIndex];
//   }
//   set theme(theme: string) {
//     const i = this.themes.findIndex((t) => t === theme);
//     if (i === -1) {
//       console.warn("Tried to set an invalid theme.");
//       return;
//     }
//     this.#themeIndex = i;
//     // if (typeof window !== 'undefined') {
//     localStorage.setItem("theme", this.themes[i]);
//     document.body.dataset.theme = this.themes[i];
//     // }
//   }
//   constructor() {
//     this.theme = localStorage.getItem("theme") ?? "dark";
//   }
//   themes = $state(themes);
//   #themeIndex = $state(0);
//   previousTheme = $derived(
//     this.themes[
//       (this.themes.length + this.#themeIndex - 1) % this.themes.length
//     ]
//   );
//   nextTheme = $derived(
//     this.themes[(this.#themeIndex + 1) % this.themes.length]
//   );
//   isLight = $derived(
//     !darkThemes.includes(this.theme as (typeof darkThemes)[number])
//   );
// }
// export const themeControl = new ThemeControl();
