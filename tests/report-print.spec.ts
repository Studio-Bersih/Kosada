import { test, expect } from '@playwright/test';

/*
| The monthly report's print sheet.
|
| Unlike the other specs this one mocks the API: whether a column gets pushed off
| the paper depends on how long the names and amounts are, so the rows have to be
| fixed, and deliberately oversized, rather than whatever the snapshot holds.
*/
const NAMA = ['MUHAMMAD ABDURRAHMAN WIJAYAKUSUMA PUTRA', 'SITI', 'BAMBANG SETIAWAN HADI PRANOTO'];
const ROWS = Array.from({ length : 60 }, (_, i) => ({
    ID            : i + 1,
    URUTAN_ATM    : i + 1,
    NAMA          : NAMA[i % NAMA.length],
    KASBON        : 125000000,
    CICILAN_TOTAL : 11250000,
    PROGRESS      : '12 / 24',
    CREATED_AT    : '2026-10-01',
    TOTAL         : 250000000
}));

// A4 landscape less the 10mm margins, in CSS pixels.
const PRINTABLE_WIDTH = 1047;

test.describe('Laporan Bulanan print sheet', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width : PRINTABLE_WIDTH, height : 700 });
        await page.route('**/Report/Print', route => route.fulfill({ json : ROWS }));
        await page.goto('/report/print?awal=2026-10-01&akhir=2026-10-31&marketing=SEMUA&nama=');
        await page.locator('.report-sheet tbody tr').first().waitFor();
        await page.emulateMedia({ media : 'print' });
    });

    test('has no loan date column, and the footer still lines up', async ({ page }) => {
        const headers = page.locator('.report-sheet thead th');
        await expect(headers).toHaveText(['#', 'No. ATM', 'Nama', 'Kasbon', 'Angsuran', 'Progress', 'Total']);
        await expect(page.locator('.report-sheet tbody')).not.toContainText('2026-10-01');

        const footerColumns = await page.locator('.report-sheet tfoot td')
            .evaluateAll(cells => cells.reduce((sum, cell) => sum + (cell as HTMLTableCellElement).colSpan, 0));
        expect(footerColumns).toBe(7);
    });

    test('prints the cells at 14pt without pushing a column off the paper', async ({ page }) => {
        // 14pt is 18.67px. Read from the cells: a size on the table never reaches them.
        for(const selector of ['thead th', 'tbody td', 'tfoot td']){
            const size = await page.locator(`.report-sheet ${selector}`).first()
                .evaluate(cell => parseFloat(getComputedStyle(cell).fontSize));
            expect(size, selector).toBeCloseTo(18.67, 1);
        }

        const right = await page.locator('.report-sheet table')
            .evaluate(table => table.getBoundingClientRect().right);
        expect(right).toBeLessThanOrEqual(PRINTABLE_WIDTH);
    });

    test('the text size switch changes the printed cells and is remembered', async ({ page }) => {
        const cellPx = () => page.locator('.report-sheet tbody td').first()
            .evaluate(cell => parseFloat(getComputedStyle(cell).fontSize));

        // The switch is .no-print, so it can only be used on the screen view.
        for(const [label, px] of [['Kecil', 13.33], ['Sedang', 16], ['Besar', 18.67]] as const){
            await page.emulateMedia({ media : 'screen' });
            await page.getByRole('button', { name : label }).click();
            await page.emulateMedia({ media : 'print' });
            expect(await cellPx(), label).toBeCloseTo(px, 1);
        }

        await page.emulateMedia({ media : 'screen' });
        await page.getByRole('button', { name : 'Kecil' }).click();
        await page.reload();
        await page.locator('.report-sheet tbody tr').first().waitFor();
        await expect(page.getByRole('button', { name : 'Kecil' })).toHaveAttribute('aria-pressed', 'true');
        expect(await cellPx()).toBeCloseTo(13.33, 1);
    });
});
