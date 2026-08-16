import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/*
| Tailwind 4 runs as a Vite plugin rather than through PostCSS. postcss.config.js
| and tailwind.config.js are both gone — configuration is CSS-first now and lives
| in src/app.css.
|
| Order matters: tailwindcss() must come before sveltekit().
*/
export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
