<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from "$lib/baseConfig";
    import { rupiahFormatter } from "$lib/formatter";
    import Header from "../features/Header.svelte";
    import MarketingSelect from "$lib/MarketingSelect.svelte";
    import { normalizeList } from "$lib/apiList";

    let newData:any = [];
    let hiddenData:any = [];

    let tanggalAwal:string;
    let tanggalAkhir:string;
    let dataMarketing:string = 'SEMUA';
    let namaNasabah:string   = '';
    let showHidden:boolean   = false;

    let page:number = 1;
    let meta:any    = { page : 1, per_page : 25, total : 0, last_page : 1 };

    // These total the rows currently on screen, so with pagination they are a page
    // total and the footer says so. The print sheet is unpaginated, so its footer
    // is the true period total.
    $: totalKasbon   = newData.reduce((sum:number, d:any) => sum + Number(d.KASBON ?? 0), 0);
    $: totalAngsuran = newData.reduce((sum:number, d:any) => sum + Number(d.CICILAN_TOTAL ?? 0), 0);
    $: totalSemua    = newData.reduce((sum:number, d:any) => sum + Number(d.TOTAL ?? 0), 0);

    const getReport = async () => {
        const doPost = await fetch(baseConfiguration.clientURL + 'Report',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                TANGGAL_AWAL    : tanggalAwal,
                TANGGAL_AKHIR   : tanggalAkhir,
                MARKETING       : dataMarketing,
                NAMA            : namaNasabah,
                page            : page,
                per_page        : meta.per_page
            })
        });
        const list = normalizeList(await doPost.json(), meta.per_page, 'Report');
        newData = list.data;
        meta    = list.meta;
        return newData;
    };

    async function doPost(){
        return toast.promise(getReport(),{
            loading : 'Memuat data..',
            success : 'Data berhasil dimuat!',
            error   : 'Ada masalah pada server'
        }, { position : 'top-right' });
    }

    function applyFilters(){
        page = 1;
        return doPost();
    }

    function gotoPage(n:number){
        if(n < 1 || n > meta.last_page || n === meta.page) return;
        page = n;
        getReport();
    }

    async function loadHidden(){
        const doGet = await fetch(baseConfiguration.clientURL + 'Laporan-Tersembunyi',{ method : 'GET' });
        hiddenData = await doGet.json();
        return hiddenData;
    }

    async function toggleHidden(ID:number, hidden:boolean){
        const doPost = await fetch(baseConfiguration.clientURL + 'Sembunyikan-Laporan',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({ ID : ID, HIDDEN : hidden })
        });
        const doResponse = await doPost.json();

        if(doResponse.status != 'success'){
            return toast.error(doResponse.message, { position : 'top-right' });
        }
        toast.success(doResponse.message, { position : 'top-right' });

        // Nothing was deleted — the loan is still on the Dashboard. Just refresh
        // whichever lists are on screen.
        if(hidden) newData = newData.filter((d:any) => d.ID !== ID);
        if(showHidden) await loadHidden();
        if(!hidden && tanggalAwal && tanggalAkhir) await getReport();
    }

    async function onToggleShowHidden(){
        showHidden = !showHidden;
        if(showHidden) await loadHidden();
    }

    /*
    | The print sheet is a separate route so it can carry a letterhead and A4 page
    | rules without the filters, buttons and nav bleeding into it. The filters ride
    | along as query params so the printed page describes itself.
    */
    $: printHref = '/report/print?' + new URLSearchParams({
        awal      : tanggalAwal  ?? '',
        akhir     : tanggalAkhir ?? '',
        marketing : dataMarketing ?? 'SEMUA',
        nama      : namaNasabah ?? ''
    }).toString();
</script>
<Toaster />
<Header />
<div class="container mx-auto">
    <div class="card w-full bg-base-100 shadow-xl my-10">
        <div class="card-body">
            <h2 class="card-title">Laporan Bulanan</h2>

            <form class="grid gap-2 grid-cols-5" on:submit|preventDefault={applyFilters}>
                <div class="form-control w-full max-w-xs">
                    <label for="cariNama" class="label">
                        <span class="label-text">Cari Nama</span>
                    </label>
                    <input id="cariNama" type="search" bind:value={namaNasabah} placeholder="Kosongkan untuk semua" class="input input-bordered w-full max-w-xs"/>
                </div>

                <div class="form-control w-full max-w-xs">
                    <label for="startDate" class="label">
                        <span class="label-text">Tanggal Awal</span>
                    </label>
                    <input id="startDate" type="date" bind:value={tanggalAwal} class="input input-bordered w-full max-w-xs" required/>
                </div>
                <div class="form-control w-full max-w-xs">
                    <label for="endDate" class="label">
                        <span class="label-text">Tanggal Akhir</span>
                    </label>
                    <input id="endDate" type="date" bind:value={tanggalAkhir} class="input input-bordered w-full max-w-xs" required/>
                </div>
                <div class="form-control w-full max-w-xs">
                    <label for="pilihMarketing" class="label">
                        <span class="label-text">Pilih Data Marketing</span>
                    </label>
                    <MarketingSelect
                        bind:value={dataMarketing}
                        includeSemua
                        semuaLabel="Tampilkan Semua Data"
                        required />
                </div>
                <button type="submit" class="btn btn-accent mt-8">Lihat Laporan</button>
            </form>

            <div class="flex justify-between items-center mt-6">
                <button type="button" class="btn btn-ghost btn-sm" on:click={onToggleShowHidden}>
                    {showHidden ? 'Sembunyikan daftar tersembunyi' : 'Tampilkan yang disembunyikan'}
                </button>

                {#if newData.length > 0}
                    <a href={printHref} target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">
                        Cetak Laporan
                    </a>
                {/if}
            </div>

            {#if showHidden}
                <div class="alert mt-4 block">
                    <h3 class="font-bold mb-2">Data yang disembunyikan dari laporan</h3>
                    <p class="text-sm opacity-70 mb-2">
                        Data ini tidak hilang. Pinjaman dan angsurannya masih tersimpan dan tetap tampil di Dashboard.
                    </p>
                    {#if hiddenData.length === 0}
                        <p class="text-sm">Tidak ada data yang disembunyikan.</p>
                    {:else}
                        <table class="table table-sm">
                            <thead>
                                <tr><th>Nama</th><th>Marketing</th><th>Progress</th><th>Tanggal</th><th></th></tr>
                            </thead>
                            <tbody>
                                {#each hiddenData as row}
                                    <tr>
                                        <td>{row.NAMA}</td>
                                        <td>{row.MARKETING}</td>
                                        <td>{row.PROGRESS}</td>
                                        <td>{row.CREATED_AT}</td>
                                        <td>
                                            <button type="button" class="btn btn-xs btn-accent" on:click={() => toggleHidden(row.ID, false)}>
                                                Tampilkan
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {/if}
                </div>
            {/if}

            <div class="overflow-x-auto mt-6">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Kasbon</th>
                            <th>Angsuran</th>
                            <th>Progress Cicilan</th>
                            <th>Tanggal Pinjaman</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each newData as data,index }
                            <tr class="hover">
                                <td>{ (meta.page - 1) * meta.per_page + index + 1 }</td>
                                <td>{ data.NAMA }</td>
                                <td>{ rupiahFormatter.format(data.KASBON) }</td>
                                <td>{ rupiahFormatter.format(data.CICILAN_TOTAL) }</td>
                                <td>{ data.PROGRESS }</td>
                                <td>{ data.CREATED_AT }</td>
                                <td class="font-bold whitespace-nowrap">{ rupiahFormatter.format(data.TOTAL) }</td>
                                <td>
                                    <button type="button" class="btn btn-xs btn-ghost" on:click={() => toggleHidden(data.ID, true)}>
                                        Sembunyikan
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                    {#if newData.length > 0}
                        <tfoot>
                            <tr class="font-bold">
                                <td colspan="2">Total halaman ini ({newData.length} data)</td>
                                <td>{ rupiahFormatter.format(totalKasbon) }</td>
                                <td>{ rupiahFormatter.format(totalAngsuran) }</td>
                                <td colspan="2"></td>
                                <td>{ rupiahFormatter.format(totalSemua) }</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    {/if}
                </table>
            </div>

            {#if newData.length > 0}
                <div class="flex justify-between items-center flex-wrap gap-2 mt-4">
                    <span class="text-sm opacity-70">
                        {meta.total} data · halaman {meta.page} dari {meta.last_page}
                        · <span class="opacity-80">cetak berisi seluruh {meta.total} data</span>
                    </span>

                    <div class="flex items-center gap-2">
                        <select bind:value={meta.per_page} on:change={applyFilters} class="select select-bordered select-sm">
                            <option value={25}>25 / halaman</option>
                            <option value={50}>50 / halaman</option>
                            <option value={100}>100 / halaman</option>
                        </select>
                        <div class="join">
                            <button type="button" class="join-item btn btn-sm" disabled={meta.page <= 1} on:click={() => gotoPage(1)}>«</button>
                            <button type="button" class="join-item btn btn-sm" disabled={meta.page <= 1} on:click={() => gotoPage(meta.page - 1)}>‹</button>
                            <button type="button" class="join-item btn btn-sm">{meta.page}</button>
                            <button type="button" class="join-item btn btn-sm" disabled={meta.page >= meta.last_page} on:click={() => gotoPage(meta.page + 1)}>›</button>
                            <button type="button" class="join-item btn btn-sm" disabled={meta.page >= meta.last_page} on:click={() => gotoPage(meta.last_page)}>»</button>
                        </div>
                    </div>
                </div>
            {/if}

        </div>
    </div>
</div>
