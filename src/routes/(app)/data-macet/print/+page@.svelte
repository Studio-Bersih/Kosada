<script lang="ts">
    /*
    | A4 print sheet for the bad-debt register.
    |
    | Uses the /Print endpoint, which applies the same filters but no pagination —
    | a printed collections list has to be complete, not just the page that
    | happened to be on screen.
    */
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { baseConfiguration } from '$lib/baseConfig';
    import { rupiahFormatter } from '$lib/formatter';
    import Letterhead from '$lib/Letterhead.svelte';

    let rows:any = [];
    let isLoading = true;
    let failed = false;

    const status    = $page.url.searchParams.get('status')    ?? 'Macet';
    const marketing = $page.url.searchParams.get('marketing') ?? 'SEMUA';
    const nama      = $page.url.searchParams.get('nama')      ?? '';

    const statusLabel = status === 'Macet'   ? 'Masih Macet'
                      : status === 'Selesai' ? 'Sudah Selesai'
                      : 'Semua Status';

    $: subtitle = `${statusLabel}`
        + ` · Marketing: ${marketing === 'SEMUA' ? 'Semua' : marketing}`
        + (nama ? ` · Nama: ${nama}` : '');

    $: totalPinjaman = rows.reduce((s:number, r:any) => s + Number(r.TOTAL_PINJAMAN ?? 0), 0);
    $: totalSisa     = rows.reduce((s:number, r:any) => s + Number(r.SISA_ANGSURAN ?? 0), 0);
    $: totalPenalti  = rows.reduce((s:number, r:any) => s + Number(r.PENALTI ?? 0), 0);
    $: totalTagihan  = rows.reduce((s:number, r:any) => s + Number(r.TOTAL_TAGIHAN ?? 0), 0);

    onMount(async () => {
        const params = new URLSearchParams({ status : status });
        if(marketing && marketing !== 'SEMUA') params.set('marketing', marketing);
        if(nama) params.set('nama', nama);

        try {
            const doGet = await fetch(baseConfiguration.clientURL + 'Data-Macet/Print?' + params.toString(), { method : 'GET' });
            const doResponse = await doGet.json();
            rows = doResponse.data ?? [];
        } catch {
            failed = true;
        }
        isLoading = false;
    });
</script>

<svelte:head><title>Data Kredit Macet — Koperasi Kosada</title></svelte:head>

<div class="container mx-auto print-sheet">
    <div class="card w-full bg-base-100 shadow-xl my-6">
        <div class="card-body">

            <div class="flex justify-end no-print">
                <button type="button" on:click={() => window.print()} class="btn btn-primary w-48 my-2" disabled={isLoading || rows.length === 0}>
                    Cetak Halaman Ini
                </button>
            </div>

            <Letterhead title="DAFTAR KREDIT MACET" subtitle={subtitle} />

            {#if isLoading}
                <p class="text-center py-10">Memuat data..</p>
            {:else if failed}
                <p class="text-center py-10">Gagal memuat data. Tutup halaman ini dan coba lagi.</p>
            {:else if rows.length === 0}
                <p class="text-center py-10">Tidak ada data kredit macet.</p>
            {:else}
                <table class="table table-xs">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th class="text-right">Total Pinjaman</th>
                            <th class="text-right">Sisa Angsuran</th>
                            <th class="text-right">Penalti 30%</th>
                            <th class="text-right">Total Tagihan</th>
                            <th>Pekerjaan</th>
                            <th>Alamat</th>
                            <th>WhatsApp</th>
                            <th>Alasan Macet</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rows as row, index}
                            <tr>
                                <td>{index + 1}</td>
                                <td>{row.NAMA}</td>
                                <td class="text-right">{rupiahFormatter.format(row.TOTAL_PINJAMAN)}</td>
                                <td class="text-right">{rupiahFormatter.format(row.SISA_ANGSURAN)}</td>
                                <td class="text-right">{rupiahFormatter.format(row.PENALTI)}</td>
                                <td class="text-right font-bold">{rupiahFormatter.format(row.TOTAL_TAGIHAN)}</td>
                                <td>{row.PEKERJAAN}</td>
                                <td>{row.ALAMAT}</td>
                                <td>{row.WHATSAPP}</td>
                                <td>{row.ALASAN_MACET}</td>
                            </tr>
                        {/each}
                    </tbody>
                    <tfoot>
                        <tr class="font-bold">
                            <td colspan="2">Total ({rows.length} data)</td>
                            <td class="text-right">{rupiahFormatter.format(totalPinjaman)}</td>
                            <td class="text-right">{rupiahFormatter.format(totalSisa)}</td>
                            <td class="text-right">{rupiahFormatter.format(totalPenalti)}</td>
                            <td class="text-right">{rupiahFormatter.format(totalTagihan)}</td>
                            <td colspan="4"></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="grid grid-cols-2 place-items-center gap-2 mt-16">
                    <h1>Petugas Penagihan</h1>
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
