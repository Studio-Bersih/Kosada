const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    // maximumSignificantDigits: 5,
    minimumFractionDigits: 0
});

function useFormat(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export type DateRange = { start: string; end: string };

/*
| The date range a list page opens on.
|
| Defaults to two calendar months: the first day of last month through the last
| day of this month.
|
| This replaced a full-year default (1 Jan – 31 Dec), which asked for 1,244 loans
| and ~196 KB before the user had done anything. Two months is enough to cover
| the current collection cycle and the one before it, which is what staff
| actually look at on arrival; anything older is a deliberate search.
*/
function defaultDateRange(months: number = 2): DateRange {
    const now: Date = new Date();

    // Day 0 of next month === last day of this month.
    const end: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const start: Date = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    return { start: useFormat(start), end: useFormat(end) };
}

/*
| "2026-08-16" -> "16 Agustus 2026". Returns the input unchanged if it isn't a
| parseable date, so a malformed value shows as itself rather than "Invalid Date".
*/
function tanggalIndonesia(value: string): string {
    if (!value) return '-';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/*
| Grouped digits for a nominal INPUT — "1000000" shown as "1.000.000".
|
| rupiahFormatter above is for DISPLAY: it prints the currency symbol, which is
| exactly what an input must not do, because whatever it renders has to be
| typeable and re-parseable on the next keystroke. These two are the input pair:
| format what is stored, parse what was typed, and never let a symbol into the
| round trip.
|
| Integers only. NOMINAL is a BIGINT and the co-op does not transfer fractions of
| a rupiah, so a decimal separator would only be a way to mistype.
*/
const ribuanFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

function formatRibuan(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    if (!Number.isFinite(value)) return '';
    return ribuanFormatter.format(Math.trunc(value));
}

/*
| "1.000.000" -> 1000000. Anything that is not a digit is dropped, so a pasted
| "Rp 1.000.000,-" survives and a stray letter cannot poison the value.
|
| Empty input returns null rather than 0. The difference matters: the form's
| "Nominal wajib diisi" check has to be able to tell a field nobody filled in
| from a transfer deliberately recorded as zero.
*/
function parseRibuan(text: string): number | null {
    const digits = (text ?? '').replace(/\D/g, '');
    if (digits === '') return null;
    return parseInt(digits, 10);
}

export { rupiahFormatter, formatRibuan, parseRibuan, defaultDateRange, tanggalIndonesia }
