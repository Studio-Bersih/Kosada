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

        await page.getByRole('button', { name : /Mulai Pencarian|Mencari/ }).click();
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

        const toggle = page.getByRole('button', { name : /Tampilkan yang disembunyikan/ });
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
            page.getByRole('button', { name : /Sembunyikan daftar tersembunyi/ })
        ).toBeVisible();
    });
});

test.describe('Data Macet', () => {
    test('filters render and the print link carries the filters', async ({ page }) => {
        await page.goto('/data-macet');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('#cariNama')).toBeVisible();
        await expect(page.locator('#pilihStatus')).toBeVisible();

        const print = page.getByRole('link', { name : /Cetak Data Macet/ });
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

test.describe('Ganti Password', () => {
    test('warns that the account is shared and validates before submitting', async ({ page }) => {
        await page.goto('/ganti-password');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText(/digunakan bersama oleh seluruh staf/)).toBeVisible();

        const submit = page.getByRole('button', { name : /Simpan Password Baru/ });
        await expect(submit).toBeDisabled();
    });
});

test.describe('Navigation', () => {
    test('every nav destination is reachable', async ({ page }) => {
        // The nav renders each link twice (desktop + hidden mobile dropdown), so
        // target the visible one rather than whichever comes first in the DOM.
        for(const href of ['/member','/report','/data-macet','/transfer-harian','/ganti-password']){
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');
            await page.locator(`a[href="${href}"]`).filter({ visible : true }).first().click();
            await expect(page).toHaveURL(new RegExp(href.replace('/','\\/')));
        }
    });
});
