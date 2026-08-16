import { defineConfig, devices } from '@playwright/test';

/*
| Smoke tests for Kosada.
|
| These exist to protect a toolchain migration (Svelte 4 -> 5, Tailwind 3 -> 4,
| daisyUI 3 -> 5). They were written and made green against the PRE-migration app
| so they encode today's behaviour, then re-run after each phase.
|
| They are deliberately shallow and structural: every route renders, the shell of
| each page is present, and the main interactions respond. They assert on
| structure rather than specific rows, because the local database is a snapshot
| and its contents drift.
|
| REQUIRES the Laravel API on http://127.0.0.1:8000 :
|     cd ../Marmyadose && php artisan serve --port=8000
| Vite is started automatically by the webServer block below.
*/
export default defineConfig({
    testDir  : './tests',
    // The suite is small; running it serially keeps output readable and avoids
    // several browsers hammering a single-threaded `php artisan serve`.
    workers  : 1,
    retries  : 0,
    timeout  : 30_000,
    reporter : [['list']],

    use : {
        baseURL      : 'http://localhost:5173',
        trace        : 'retain-on-failure',
        screenshot   : 'only-on-failure',
        actionTimeout: 10_000
    },

    projects : [
        { name : 'chromium', use : { ...devices['Desktop Chrome'] } }
    ],

    webServer : {
        command             : 'npm run dev -- --port 5173',
        url                 : 'http://localhost:5173',
        reuseExistingServer : true,
        timeout             : 120_000
    }
});
