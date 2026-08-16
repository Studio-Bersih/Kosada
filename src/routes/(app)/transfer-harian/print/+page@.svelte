<script lang="ts">
    /*
    | A4 print sheet for one day's transfers — the replacement for the handwritten
    | daily sheet. Always a single day, unpaginated.
    */
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { baseConfiguration } from '$lib/baseConfig';
    import { rupiahFormatter } from '$lib/formatter';
    import Letterhead from '$lib/Letterhead.svelte';

    let rows:any = [];
    let meta:any = { total : 0, total_nominal : 0 };
    let isLoading = true;
    let failed = false;

    const tanggal = $page.url.searchParams.get('tanggal') ?? '';

    function tanggalIndonesia(value:string){
        if(!value) return '-';
        const d = new Date(value);
        if(isNaN(d.getTime())) return value;
        return d.toLocaleDateString('id-ID', { weekday : 'long', day : 'numeric', month : 'long', year : 'numeric' });
    }

    onMount(async () => {
        try {
            const doGet = await fetch(baseConfiguration.clientURL + 'Transfer-Harian/Print?tanggal=' + encodeURIComponent(tanggal), { method : 'GET' });
            const doResponse = await doGet.json();
            rows = doResponse.data ?? [];
            meta = doResponse.meta ?? meta;
        } catch {
            failed = true;
        }
        isLoading = false;
    });
</script>

<svelte:head><title>Transfer Harian — Koperasi Kosada</title></svelte:head>

<div class="container mx-auto print-sheet">
    <div class="card w-full bg-base-100 shadow-xl my-6">
        <div class="card-body">

            <div class="flex justify-end no-print">
                <button type="button" on:click={() => window.print()} class="btn btn-primary w-48 my-2" disabled={isLoading || rows.length === 0}>
                    Cetak Halaman Ini
                </button>
            </div>

            <!-- The date is the heading, centered above the table and outside the
                 columns, matching the handwritten sheet this replaces. -->
            <Letterhead title="DAFTAR TRANSFER HARIAN" subtitle={tanggalIndonesia(tanggal)} />

            {#if isLoading}
                <p class="text-center py-10">Memuat data..</p>
            {:else if failed}
                <p class="text-center py-10">Gagal memuat data. Tutup halaman ini dan coba lagi.</p>
            {:else if rows.length === 0}
                <p class="text-center py-10">Belum ada data transfer pada tanggal ini.</p>
            {:else}
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Keterangan</th>
                            <th>Instansi</th>
                            <th class="text-right">Uang Ditransfer</th>
                            <th>Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each rows as row, index}
                            <tr>
                                <td>{index + 1}</td>
                                <td>{row.NAMA}</td>
                                <td>{row.JENIS}</td>
                                <td>{row.INSTANSI}</td>
                                <td class="text-right">{rupiahFormatter.format(row.NOMINAL)}</td>
                                <td>{row.KETERANGAN ?? '-'}</td>
                            </tr>
                        {/each}
                    </tbody>
                    <tfoot>
                        <tr class="font-bold">
                            <td colspan="4">Total ({meta.total} data)</td>
                            <td class="text-right">{rupiahFormatter.format(meta.total_nominal)}</td>
                            <td></td>
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
