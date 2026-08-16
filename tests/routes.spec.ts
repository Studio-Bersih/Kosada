import { test, expect } from '@playwright/test';

/*
| Every route renders.
|
| The cheapest and most valuable check during a framework migration: a Svelte 5
| or SvelteKit 2 incompatibility usually shows up as a page that 500s or renders
| blank, and this catches that across all 15 routes in a few seconds.
|
| Each route is paired with a string that only appears once its markup has
| actually rendered — not just a 200, which SvelteKit returns for an error page
| too.
*/

/*
| `marker` is the page's own heading, matched inside .card-title rather than
| anywhere on the page. The nav renders every label twice — once for desktop and
| once in a hidden mobile dropdown — so a bare getByText('Ganti Password') finds
| the hidden nav link instead of the heading and fails on visibility.
*/
const APP_ROUTES = [
    { path : '/',                 marker : 'Masuk' },
    { path : '/dashboard',        marker : 'Data Pinjaman' },
    { path : '/member',           marker : 'Member Koperasi Kosada' },
    { path : '/tambah-member',    marker : 'Penambahan Member Baru' },
    { path : '/tambah-kredit',    marker : 'Penambahan Kredit Baru' },
    { path : '/report',           marker : 'Laporan Bulanan' },
    { path : '/data-macet',       marker : 'Data Kredit Macet' },
    { path : '/transfer-harian',  marker : 'Data Transfer Harian' },
    { path : '/surat-tugas',      marker : 'Surat Tugas!' },
    { path : '/ganti-password',   marker : 'Ganti Password' }
];

const PRINT_ROUTES = [
    { path : '/report/print?awal=2020-01-01&akhir=2027-12-31&marketing=SEMUA&nama=', marker : 'LAPORAN BULANAN' },
    { path : '/data-macet/print?status=SEMUA&marketing=SEMUA&nama=',                 marker : 'DAFTAR KREDIT MACET' },
    { path : '/transfer-harian/print?tanggal=2026-08-16',                            marker : 'DAFTAR TRANSFER HARIAN' }
];

for(const route of APP_ROUTES){
    test(`renders ${route.path}`, async ({ page }) => {
        const response = await page.goto(route.path);
        expect(response?.status(), `${route.path} should not error`).toBeLessThan(400);

        /*
        | filter({ visible: true }), not locator('visible=true') — the latter looks
        | for visible elements INSIDE the match rather than filtering the match,
        | which passes by accident whenever the text also matches an ancestor.
        */
        await expect(
            page.getByText(route.marker, { exact : false }).filter({ visible : true }).first()
        ).toBeVisible();
    });
}

for(const route of PRINT_ROUTES){
    test(`renders print sheet ${route.path.split('?')[0]}`, async ({ page }) => {
        const response = await page.goto(route.path);
        expect(response?.status()).toBeLessThan(400);
        // Print sheets fetch on mount, so wait for the letterhead rather than data.
        await expect(page.getByText(route.marker).first()).toBeVisible();
        await expect(page.getByText('KOSADA').first()).toBeVisible();
    });
}

test('no page throws an uncaught client-side error', async ({ page }) => {
    const errors:string[] = [];
    page.on('pageerror', e => errors.push(e.message));

    for(const route of APP_ROUTES){
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
    }

    expect(errors, `uncaught errors:\n${errors.join('\n')}`).toEqual([]);
});
