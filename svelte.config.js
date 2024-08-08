import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const base = process.env.BASE_PATH || ''
console.log("BASE_PATH", base)
/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    paths: {
      base,
    },
    alias: {
      $lib: 'src/lib',
    }
  },
};

export default config;
