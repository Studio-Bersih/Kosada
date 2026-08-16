<script lang="ts">
    import toast from '$lib/toast';
    import { baseConfiguration } from "$lib/baseConfig";
    import { rupiahFormatter } from "$lib/formatter";
    import MarketingSelect from "$lib/MarketingSelect.svelte";
    import { normalizeList, readJsonArray } from "$lib/apiList";
    import PageHeader from "$lib/PageHeader.svelte";
    import Panel from "$lib/Panel.svelte";
    import Icon from "$lib/Icon.svelte";

    let newData:any = [];
    let hiddenData:any = [];

    let showHidden:boolean   = false;

    /*
    | `form` is what the user is editing, `applied` is what the table is showing.
    | The Cetak link is built from `applied`, so a printout always matches what is
    | on screen rather than filters that were changed but never submitted.
    */
    let form    = { awal : '', akhir : '', marketing : 'SEMUA', nama : '' };
    let applied = { awal : '', akhir : '', marketing : 'SEMUA', nama : '' };

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
                TANGGAL_AWAL    : applied.awal,
                TANGGAL_AKHIR   : applied.akhir,
                MARKETING       : applied.marketing,
                NAMA            : applied.nama,
                page            : page,
                per_page        : meta.per_page
            })
        });
        const list = normalizeList(await doPost.json(), {
            page    : page,
            perPage : meta.per_page,
            label   : 'Report'
        });
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
        applied = { ...form };
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
        // Same guard as Status-Macet: this route only exists on the updated backend.
        hiddenData = await readJsonArray(doGet, 'Laporan-Tersembunyi');
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
        if(!hidden && applied.awal && applied.akhir) await getReport();
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
        awal      : applied.awal  ?? '',
        akhir     : applied.akhir ?? '',
        marketing : applied.marketing ?? 'SEMUA',
        nama      : applied.nama ?? ''
    }).toString();
</script>
<svelte:head><title>Laporan — Kosada</title></svelte:head>

<PageHeader title="Laporan Bulanan" description="Rekap kasbon dan angsuran per periode">
    <svelte:fragment slot="meta">
        {#if meta.total > 0}
            <span aria-hidden="true">·</span>
            <span><strong class="text-base-content">{meta.total.toLocaleString('id-ID')}</strong> data</span>
            <span aria-hidden="true">·</span>
            <span>cetak berisi seluruhnya</span>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <button type="button" class="btn btn-ghost btn-sm" on:click={onToggleShowHidden}>
            {showHidden ? 'Sembunyikan daftar' : 'Yang disembunyikan'}
        </button>
        {#if newData.length > 0}
            <a href={printHref} target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">
                <Icon name="print" size={16} /> Cetak
            </a>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="toolbar">
        <form class="px-4 lg:px-8 pb-3 flex flex-wrap items-center gap-2"
              on:submit|preventDefault={applyFilters}>
            <label class="input input-bordered input-sm flex items-center gap-2 grow max-w-xs">
                <Icon name="search" size={16} />
                <input id="cariNama" type="search" bind:value={form.nama}
                       placeholder="Cari nama (kosongkan untuk semua)" class="grow min-w-0"/>
            </label>

            <div class="flex items-center gap-1 text-sm">
                <input id="startDate" type="date" bind:value={form.awal}
                       class="input input-bordered input-sm" aria-label="Tanggal awal" required/>
                <span class="text-muted">—</span>
                <input id="endDate" type="date" bind:value={form.akhir}
                       class="input input-bordered input-sm" aria-label="Tanggal akhir" required/>
            </div>

            <MarketingSelect
                bind:value={form.marketing}
                includeSemua
                semuaLabel="Semua Marketing"
                class="select select-bordered select-sm"
                required />

            <button type="submit" class="btn btn-primary btn-sm">Lihat Laporan</button>
        </form>
    </svelte:fragment>
</PageHeader>

<div class="px-4 lg:px-8 py-5 space-y-5">
            {#if showHidden}
                <div class="alert block">
                    <h3 class="font-bold mb-2">Data yang disembunyikan dari laporan</h3>
                    <p class="text-sm opacity-70 mb-2">
                        Data ini tidak hilang. Pinjaman dan angsurannya masih tersimpan dan tetap tampil di Dashboard.
                    </p>
                    {#if hiddenData.length === 0}
                        <p class="text-sm">Tidak ada data yang disembunyikan.</p>
                    {:else}
                        <table class="table-kosada">
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
                                            <button type="button" class="btn btn-xs btn-ghost" on:click={() => toggleHidden(row.ID, false)}>
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

    <Panel flush>
            <div class="overflow-x-auto max-h-[70vh]">
                <table class="table-kosada">
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
                <div class="flex justify-between items-center flex-wrap gap-2 border-t border-base-300 px-4 py-3">
                    <span class="text-sm text-muted">
                        {meta.total.toLocaleString('id-ID')} data · halaman {meta.page} dari {meta.last_page}
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
    </Panel>
</div>
