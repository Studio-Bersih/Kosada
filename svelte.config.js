import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';
const config = {
	kit: {
		// Left to itself, adapter-vercel@3 derives the runtime from the Node
		// version running the build and only knows 16, 18 and 20, so anything
		// newer makes it throw "Unsupported Node.js version". Naming the runtime
		// skips that guess entirely — validation here is just /nodejs(\d+)\.x/
		// with a minimum of 16, so a current version is fine.
		//
		// This must stay in step with the Node.js Version in the Vercel project
		// settings; Vercel discontinues old ones and refuses to build until the
		// setting is moved forward.
		adapter: adapter({ runtime: 'nodejs24.x' })
	},
	preprocess: vitePreprocess()
};

export default config;
