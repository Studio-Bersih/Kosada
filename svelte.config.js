import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';
const config = {
	kit: {
		// adapter-vercel@3 derives the runtime from the Node version running the
		// build, and only knows 16, 18 and 20. Anything newer makes it throw
		// "Unsupported Node.js version" and the deployment never gets built.
		// Naming the runtime explicitly is what the error message itself asks
		// for, and it keeps the build working whatever Node the builder uses.
		adapter: adapter({ runtime: 'nodejs20.x' })
	},
	preprocess: vitePreprocess()
};

export default config;
