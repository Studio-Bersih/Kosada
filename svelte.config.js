import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	kit: {
		// Naming the runtime explicitly rather than letting the adapter infer it
		// from the build machine's Node version. This must stay in step with the
		// Node.js Version in the Vercel project settings; Vercel discontinues old
		// ones and refuses to build until the setting is moved forward.
		adapter: adapter({ runtime: 'nodejs24.x' })
	},
	// Moved out of '@sveltejs/kit/vite' in SvelteKit 2.
	preprocess: vitePreprocess()
};

export default config;
