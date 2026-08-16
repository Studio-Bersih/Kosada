import { test, expect } from '@playwright/test';

/*
| The main interactions.
|
| Structural assertions only. The local database is a snapshot whose contents
| drift, so these check that controls exist and respond — not that a particular
| nasabah appears. A migration that breaks event handling, reactivity or the
| fetch layer fails these; a migration that is fine passes them regardless of
| what data happens to be present.
*/

test.describe('Dashboard', () => {
    test('filter form submits without navigating away', async ({ page }) => {
        await page.goto('/dashboard');
        // Wait for hydration. Filling the server-rendered input before SvelteKit
        // takes over gets silently discarded when the client bundle mounts.
        await page.waitForLoadState('networkidle');

        const cari = page.locator('#cariNama');
        await expect(cari).toBeVisible();
        await cari.fill('budi');

        // Typing alone must NOT trigger a request — search is submit-only.
        await page.waitForTimeout(600);
        await expect(cari).toHaveValue('budi');

        await page.getByRole('button', { name : /^Cari$|Mencari/ }).click();
        await expect(page).toHaveURL(/\/dashboard/);
        await expect(page.locator('table').first()).toBeVisible();
    });

    test('shows the active date range and pagination bar', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText(/halaman \d+ dari \d+/)).toBeVisible();
        await expect(page.getByText(/\d{4}/).first()).toBeVisible();
    });

    test('marketing filter and date inputs are present', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.locator('select').first()).toBeVisible();
        await expect(page.locator('input[type="date"]')).toHaveCount(2);
    });
});

test.describe('Anggota Koperasi', () => {
    test('has a search box, a Cari button and a pagination bar', async ({ page }) => {
        await page.goto('/member');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('input[type="search"]').first()).toBeVisible();
        await expect(page.getByRole('button', { name : /Cari|Mencari/ }).first()).toBeVisible();
        await expect(page.getByText(/halaman \d+ dari \d+/)).toBeVisible();
    });
});

test.describe('Laporan', () => {
    test('requires dates and exposes the hidden-rows panel', async ({ page }) => {
        await page.goto('/report');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#startDate')).toBeVisible();
        await expect(page.locator('#endDate')).toBeVisible();

        const toggle = page.getByRole('button', { name : /Yang disembunyikan/ });
        await expect(toggle).toBeVisible();
        await toggle.click();

        // The panel is a daisyUI .alert, which takes role="alert" and does not
        // expose its inner h3 as a heading — so match the copy instead.
        await expect(
            page.getByText('Pinjaman dan angsurannya masih tersimpan').first()
        ).toBeVisible();

        // `toggle` was located BY its accessible name, so it stops matching once
        // the label flips. Assert the new label as its own locator.
        await expect(
            page.getByRole('button', { name : /Sembunyikan daftar/ })
        ).toBeVisible();
    });
});

test.describe('Data Macet', () => {
    test('filters render and the print link carries the filters', async ({ page }) => {
        await page.goto('/data-macet');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#cariNama')).toBeVisible();
        await expect(page.locator('#pilihStatus')).toBeVisible();

        const print = page.getByRole('link', { name : /Cetak/ });
        await expect(print).toBeVisible();
        await expect(print).toHaveAttribute('href', /status=/);
    });
});

test.describe('Transfer Harian', () => {
    test('date picker drives the sheet and the entry form is present', async ({ page }) => {
        await page.goto('/transfer-harian');
        await page.waitForLoadState('networkidle');

        const tanggal = page.locator('input[type="date"]').first();
        await expect(tanggal).toBeVisible();
        await expect(tanggal).not.toHaveValue('');

        await expect(page.locator('#cariNasabah')).toBeVisible();
        await expect(page.locator('#pilihJenis')).toBeVisible();
        await expect(page.locator('#inputNominal')).toBeVisible();
    });
});

test.describe('Tambah Kredit', () => {
    test('uses a member typeahead, not a 2,700-option dropdown', async ({ page }) => {
        await page.goto('/tambah-kredit');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#inputNasabah')).toBeVisible();

        // Only the jangka-waktu select should carry many options now.
        const optionCount = await page.locator('option').count();
        expect(optionCount).toBeLessThan(60);
    });
});

test.describe('Navigation', () => {
    test('every nav destination is reachable', async ({ page }) => {
        // The nav renders each link twice (desktop + hidden mobile dropdown), so
        // target the visible one rather than whichever comes first in the DOM.
        for(const href of ['/member','/report','/data-macet','/transfer-harian']){
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');
            await page.locator(`a[href="${href}"]`).filter({ visible : true }).first().click();
            await expect(page).toHaveURL(new RegExp(href.replace('/','\\/')));
        }
    });
});

test.describe('Manajemen Akun', () => {
    /*
    | Role checks in the UI decide what is SHOWN. The real enforcement is
    | server-side and is covered by the backend tests; these assert that the
    | interface tells the truth about it.
    */
    async function signInAs(page:any, privilege:string){
        await page.goto('/dashboard');
        await page.evaluate((p:string) => localStorage.setItem('kosada.account',
            JSON.stringify({ email:'someone@kosada.id', name:'Tester', privilege:p })), privilege);
        await page.reload();
        await page.waitForLoadState('networkidle');
    }

    test('Staff does not see Manajemen Akun in the nav', async ({ page }) => {
        await signInAs(page, 'Staff');
        await expect(page.locator('a[href="/akun"]')).toHaveCount(0);
        // Everything else stays reachable — Staff can use the rest of the system.
        await expect(page.locator('a[href="/dashboard"]').first()).toBeVisible();
        await expect(page.locator('a[href="/member"]').first()).toBeVisible();
    });

    test('Administrator sees Manajemen Akun', async ({ page }) => {
        await signInAs(page, 'Administrator');
        await expect(page.locator('a[href="/akun"]').first()).toBeVisible();
    });

    test('Staff on /akun can read the list but gets no actions', async ({ page }) => {
        await signInAs(page, 'Staff');
        await page.goto('/akun');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText(/hanya untuk akun/)).toBeVisible();
        await expect(page.getByRole('button', { name : /Tambah Akun/ })).toHaveCount(0);
    });
});

test.describe('Administrator-only row actions', () => {
    async function signInAs(page:any, privilege:string){
        await page.goto('/dashboard');
        await page.evaluate((p:string) => localStorage.setItem('kosada.account',
            JSON.stringify({ email:'someone@kosada.id', name:'Tester', privilege:p })), privilege);
    }

    test('Transfer Harian: Hapus is disabled for Staff, enabled for Administrator', async ({ page }) => {
        await signInAs(page, 'Staff');
        await page.goto('/transfer-harian');
        await page.waitForLoadState('networkidle');
        const staffButtons = page.getByRole('button', { name : 'Hapus' });
        if(await staffButtons.count() > 0){
            await expect(staffButtons.first()).toBeDisabled();
        }

        await signInAs(page, 'Administrator');
        await page.goto('/transfer-harian');
        await page.waitForLoadState('networkidle');
        const adminButtons = page.getByRole('button', { name : 'Hapus' });
        if(await adminButtons.count() > 0){
            await expect(adminButtons.first()).toBeEnabled();
        }
    });

    test('Data Macet: Selesai is disabled for Staff, enabled for Administrator', async ({ page }) => {
        await signInAs(page, 'Staff');
        await page.goto('/data-macet?status=SEMUA');
        await page.waitForLoadState('networkidle');
        const staffButtons = page.getByRole('button', { name : 'Selesai' });
        if(await staffButtons.count() > 0){
            await expect(staffButtons.first()).toBeDisabled();
        }

        await signInAs(page, 'Administrator');
        await page.goto('/data-macet?status=SEMUA');
        await page.waitForLoadState('networkidle');
        const adminButtons = page.getByRole('button', { name : 'Selesai' });
        if(await adminButtons.count() > 0){
            await expect(adminButtons.first()).toBeEnabled();
        }
    });
});

/*
| The Drawer must measure itself against the viewport, not against the page.
|
| It regressed once already. `.page-enter` animates `kosada-rise`, and while that
| animation filled `forwards` the element kept a resolved `transform` matrix
| forever — Chrome reports `matrix(1, 0, 0, 1, 0, 0)`, which is not `none`. A
| transform that is not `none` makes an element a containing block for every
| `position: fixed` descendant, so the Drawer's `inset-y-0` resolved against the
| page content box (321px) instead of the window (720px). Short pages gave short
| drawers.
|
| The fix is `backwards` rather than `both` on every user of that keyframe. These
| tests fail if anyone puts `forwards`/`both` back, or introduces a transform,
| filter, perspective or `contain` on an ancestor of the Drawer.
*/
test.describe('Drawer geometry', () => {
    test('.page-enter settles with no transform, so it traps nothing', async ({ page }) => {
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const settled = await page.evaluate(() => {
            const pe = document.querySelector('.page-enter');
            const panel = document.querySelector('section[style*="kosada-rise"]');
            const row = document.querySelector('.table-kosada tbody tr');
            return {
                pageEnter : pe ? getComputedStyle(pe).transform : null,
                panel     : panel ? getComputedStyle(panel).transform : 'none',
                row       : row ? getComputedStyle(row).transform : 'none'
            };
        });

        expect(settled.pageEnter).toBe('none');
        expect(settled.panel).toBe('none');
        expect(settled.row).toBe('none');
    });

    test('an open Drawer is full viewport height', async ({ page }) => {
        await page.goto('/dashboard');
        await page.evaluate(() => localStorage.setItem('kosada.account',
            JSON.stringify({ email:'someone@kosada.id', name:'Tester', privilege:'Administrator' })));
        await page.goto('/akun');
        await page.waitForLoadState('networkidle');

        await page.getByRole('button', { name : /Tambah Akun/i }).first().click();
        // Let the slide-in settle before measuring.
        await page.waitForTimeout(500);

        const geo = await page.evaluate(() => {
            // The Sidebar is also an `aside.fixed`; the Drawer is the one inside
            // the page content.
            const drawer = [...document.querySelectorAll('aside.fixed')]
                .find(a => a.closest('.page-enter'));
            const pageEnter = document.querySelector('.page-enter');
            if(!drawer || !pageEnter) throw new Error('Drawer or .page-enter not found');

            const r = drawer.getBoundingClientRect();
            return {
                height    : r.height,
                top       : r.top,
                right     : r.right,
                viewportH : window.innerHeight,
                viewportW : window.innerWidth,
                pageH     : pageEnter.getBoundingClientRect().height
            };
        });

        expect(geo.height).toBe(geo.viewportH);
        expect(geo.top).toBe(0);
        expect(geo.right).toBe(geo.viewportW);
        // The bug this guards: the page is shorter than the window, and the
        // Drawer used to inherit that height.
        expect(geo.pageH).toBeLessThan(geo.viewportH);
    });
});
