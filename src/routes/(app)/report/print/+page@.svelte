<script lang="ts">
    /*
    | A4 print sheet for the monthly report.
    |
    | Deliberately a separate route from /report: the letterhead, page rules and
    | full unpaginated result set have nothing to do with the on-screen filter UI.
    | Filters arrive as query params so the printed page states its own scope.
    */
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { baseConfiguration } from '$lib/baseConfig';
    import { rupiahFormatter } from '$lib/formatter';
    import { readListAll } from '$lib/apiList';
    import Letterhead from '$lib/Letterhead.svelte';

    let rows:any = [];
    let isLoading = true;
    let failed = false;

    const awal      = $page.url.searchParams.get('awal')      ?? '';
    const akhir     = $page.url.searchParams.get('akhir')     ?? '';
    const marketing = $page.url.searchParams.get('marketing') ?? 'SEMUA';
    const nama      = $page.url.searchParams.get('nama')      ?? '';

    $: totalKasbon   = rows.reduce((s:number, d:any) => s + Number(d.KASBON ?? 0), 0);
    $: totalAngsuran = rows.reduce((s:number, d:any) => s + Number(d.CICILAN_TOTAL ?? 0), 0);
    $: totalSemua    = rows.reduce((s:number, d:any) => s + Number(d.TOTAL ?? 0), 0);

    function tanggalIndonesia(value:string){
        if(!value) return '-';
        const d = new Date(value);
        if(isNaN(d.getTime())) return value;
        return d.toLocaleDateString('id-ID', { day : 'numeric', month : 'long', year : 'numeric' });
    }

    $: periode = `Periode ${tanggalIndonesia(awal)} s/d ${tanggalIndonesia(akhir)}`
        + ` · Marketing: ${marketing === 'SEMUA' ? 'Semua' : marketing}`
        + (nama ? ` · Nama: ${nama}` : '');

    /*
    | Text size for the sheet. Besar is the default because the office asked for
    | larger text, and it is also the widest: it fits landscape A4, so the smaller
    | sizes do too. The choice is remembered per browser.
    */
    const UKURAN = [
        { label : 'Kecil',  pt : '10pt' },
        { label : 'Sedang', pt : '12pt' },
        { label : 'Besar',  pt : '14pt' }
    ];
    const UKURAN_KEY = 'kosada-laporan-ukuran';

    let ukuran = 'Besar';
    $: ukuranPt = UKURAN.find(u => u.label === ukuran)?.pt ?? '14pt';

    function pilihUkuran(label:string){
        ukuran = label;
        try { localStorage.setItem(UKURAN_KEY, label); } catch {}
    }

    onMount(async () => {
        try {
            const tersimpan = localStorage.getItem(UKURAN_KEY);
            if(UKURAN.some(u => u.label === tersimpan)) ukuran = tersimpan as string;
        } catch {}

        try {
            // Report/Print, not Report: the screen endpoint is paginated and a
            // printed monthly report must contain every row.
            const body = JSON.stringify({
                TANGGAL_AWAL  : awal,
                TANGGAL_AKHIR : akhir,
                MARKETING     : marketing,
                NAMA          : nama
            });

            let doPost = await fetch(baseConfiguration.clientURL + 'Report/Print', {
                method  : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body    : body
            });

            /*
            | Report/Print only exists on the updated backend. Against an older one
            | it 404s, and a print sheet that silently comes out empty is worse than
            | almost any other failure — so fall back to Report, which on that
            | backend is unpaginated anyway and therefore still complete.
            */
            if(doPost.status === 404){
                console.warn('[Kosada] Report/Print not found — falling back to Report. Deploy Marmyadose to get the paginated split.');
                doPost = await fetch(baseConfiguration.clientURL + 'Report', {
                    method  : 'POST',
                    headers : { 'Content-Type' : 'application/json' },
                    body    : body
                });
            }

            // readListAll, not normalizeList: a print sheet must carry every row.
            rows = readListAll(await doPost.json());
        } catch {
            failed = true;
        }
        isLoading = false;
    });
</script>

<svelte:head><title>Laporan Bulanan — Koperasi Kosada</title></svelte:head>

<div class="container mx-auto print-sheet report-sheet" style="--ukuran-tulisan: {ukuranPt}">
    <div class="card w-full bg-base-100 shadow-xl my-6">
        <div class="card-body">

            <div class="flex flex-wrap justify-end items-center gap-3 no-print">
                <div class="flex items-center gap-2">
                    <span class="text-sm">Ukuran tulisan</span>
                    <div class="join">
                        {#each UKURAN as pilihan}
                            <button type="button"
                                    class="join-item btn btn-sm"
                                    class:btn-primary={ukuran === pilihan.label}
                                    aria-pressed={ukuran === pilihan.label}
                                    on:click={() => pilihUkuran(pilihan.label)}>
                                {pilihan.label}
                            </button>
                        {/each}
                    </div>
                </div>
                <button type="button" on:click={() => window.print()} class="btn btn-primary w-48 my-2" disabled={isLoading || rows.length === 0}>
                    Cetak Halaman Ini
                </button>
            </div>

            <Letterhead title="LAPORAN BULANAN" subtitle={periode} />

            {#if isLoading}
                <p class="text-center py-10">Memuat data..</p>
            {:else if failed}
                <p class="text-center py-10">Gagal memuat data. Tutup halaman ini dan coba lagi.</p>
            {:else if rows.length === 0}
                <p class="text-center py-10">Tidak ada data pada periode ini.</p>
            {:else}
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>No. ATM</th>
                            <th>Nama</th>
                            <th class="text-right">Kasbon</th>
                            <th class="text-right">Angsuran</th>
                            <th>Progress</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rows as row, index}
                            <tr>
                                <td>{index + 1}</td>
                                <td>{row.URUTAN_ATM ?? '-'}</td>
                                <td>{row.NAMA}</td>
                                <td class="text-right">{rupiahFormatter.format(row.KASBON)}</td>
                                <td class="text-right">{rupiahFormatter.format(row.CICILAN_TOTAL)}</td>
                                <td>{row.PROGRESS}</td>
                                <td class="text-right font-bold">{rupiahFormatter.format(row.TOTAL)}</td>
                            </tr>
                        {/each}
                    </tbody>
                    <tfoot>
                        <tr class="font-bold">
                            <td colspan="3">Total ({rows.length} data)</td>
                            <td class="text-right">{rupiahFormatter.format(totalKasbon)}</td>
                            <td class="text-right">{rupiahFormatter.format(totalAngsuran)}</td>
                            <td></td>
                            <td class="text-right">{rupiahFormatter.format(totalSemua)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="grid grid-cols-2 place-items-center gap-2 mt-16">
                    <h1>Petugas</h1>
                    <h1>Mengetahui</h1>
                </div>
                <div class="grid grid-cols-2 place-items-center gap-2 mt-16">
                    <h1>(............................)</h1>
                    <h1>Koperasi Kosada</h1>
                </div>
            {/if}

        </div>
    </div>
</div>

<style>
    /*
    | Landscape because the office asked for larger text: at 14pt the rupiah columns
    | do not fit portrait A4, and the column they push off the page is Total.
    */
    @page laporan {
        size: A4 landscape;
        margin: 10mm;
    }
    .report-sheet {
        page: laporan;
    }
    /*
    | Not limited to print, so the choice is visible before printing. On the cells:
    | table-sm sizes th and td itself, so a size on the table never reaches them.
    */
    .report-sheet th,
    .report-sheet td {
        font-size: var(--ukuran-tulisan);
    }
</style>
