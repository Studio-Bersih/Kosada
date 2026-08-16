<script lang="ts">
    import MarketingSelect from "$lib/MarketingSelect.svelte";
    import Icon from "$lib/Icon.svelte";
    import EmptyState from "$lib/EmptyState.svelte";
    import SkeletonRows from "$lib/SkeletonRows.svelte";
    import PageHeader from "$lib/PageHeader.svelte";
    import Panel from "$lib/Panel.svelte";
    import Drawer from "$lib/Drawer.svelte";
    import { defaultDateRange, rupiahFormatter, tanggalIndonesia } from "$lib/formatter";
    import { baseConfiguration } from "$lib/baseConfig";
    import { normalizeList, readJsonArray } from "$lib/apiList";
    import toast from '$lib/toast';
    import { onMount } from "svelte";

    // export let data;

    let newData:any             = [];

    let page:number             = 1;
    let meta:any                = { page : 1, per_page : 25, total : 0, last_page : 1 };

    type Form = Record<"start" | "end", string>;

    /*
    | Two sets of filter values.
    |
    | `form` is what the user is currently typing. `applied` is what the table is
    | actually showing. Nothing queries until the form is submitted, and paging
    | uses `applied` — so clicking page 2 after typing a half-finished name gives
    | you page 2 of what is on screen, not page 2 of something you never searched.
    */
    // Opens on the last two calendar months. See defaultDateRange().
    const defaultRange = defaultDateRange(2);

    let form = {
        nama     : '',
        kategori : 'SEMUA',
        date     : { ...defaultRange } as Form
    };

    let applied = {
        nama     : form.nama,
        kategori : form.kategori,
        date     : { ...form.date }
    };

    // What the table is currently showing, spelled out under the filters so the
    // default range is never a mystery.
    $: rangeLabel     = `${tanggalIndonesia(applied.date.start)} – ${tanggalIndonesia(applied.date.end)}`;
    $: isDefaultRange = applied.date.start === defaultRange.start
                     && applied.date.end   === defaultRange.end;

    function resetRange(){
        form.date = { ...defaultRange };
    }

    let isLoading: boolean = false;

    let isModal:boolean         = false;
    let isDelete:boolean        = false;
    let modalData:any           = [];

    // Loans already in the Kredit Macet register, so the modal badges them
    // instead of offering the button again.
    let macetIDs:any            = [];
    let isMacet:boolean         = false;
    let alasanMacet:string      = '';

    $: sudahMacet = modalData?.ID !== undefined && macetIDs.includes(modalData.ID);

    let id:number;

    onMount(() => doPost());

    async function doPost(): Promise <void>{
        isLoading = true;
        try {
            const doPost = await fetch(baseConfiguration.clientURL + 'Realisasi-Kredit-Range', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: applied.date.start,
                    end: applied.date.end,
                    kategori: applied.kategori,
                    nama: applied.nama,
                    page: page,
                    per_page: meta.per_page
                })
            });

            const list = normalizeList(await doPost.json(), {
                page    : page,
                perPage : meta.per_page,
                label   : 'Realisasi-Kredit-Range'
            });
            newData = list.data;
            meta    = list.meta;

            await loadStatusMacet();
        } catch {
            toast.error('Ada masalah pada server', { position : 'top-right' });
        }
        isLoading = false;
    }

    /*
    | Runs only when the form is submitted — the search boxes deliberately do not
    | query as you type.
    */
    function applyFilters(){
        applied = {
            nama     : form.nama,
            kategori : form.kategori,
            date     : { ...form.date }
        };
        page = 1;
        return doPost();
    }

    function gotoPage(n:number){
        if(n < 1 || n > meta.last_page || n === meta.page) return;
        page = n;
        doPost();
    }

    /*
    | Which loans on this page are already registered as macet, so the modal shows
    | a badge instead of offering to add them again. One request for the whole
    | page rather than one per row.
    */
    async function loadStatusMacet(){
        if(!Array.isArray(newData) || newData.length === 0){
            macetIDs = [];
            return;
        }
        try {
            const doPost = await fetch(baseConfiguration.clientURL + 'Status-Macet',{
                method  : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify({ IDS : newData.map((d:any) => d.ID) })
            });

            /*
            | readJsonArray, not .json(): on a backend without this route the 404
            | body is {"message":"..."} — an object. Assigning that here made
            | `macetIDs.includes(...)` throw when a detail modal opened.
            */
            macetIDs = await readJsonArray(doPost, 'Status-Macet');
        } catch {
            // Non-fatal: worst case the button shows when a badge would do, and
            // the backend still refuses the duplicate.
            macetIDs = [];
        }
    }

    function openMacet(){
        alasanMacet = '';
        isMacet     = true;
    }

    async function doTambahMacet(){
        if(!alasanMacet.trim()){
            return toast.error('Alasan kredit macet wajib diisi', { position : 'top-right' });
        }

        const doPost = await fetch(baseConfiguration.clientURL + 'Tambah-Macet',{
            method  : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body    : JSON.stringify({ KREDIT_ID : modalData.ID, ALASAN_MACET : alasanMacet })
        });
        const doResponse = await doPost.json();

        if(doResponse.status == 'success'){
            toast.success(doResponse.message, { position : 'top-right' });
            isMacet  = false;
            macetIDs = [...macetIDs, modalData.ID];
        } else {
            toast.error(doResponse.message ?? 'Gagal menyimpan', { position : 'top-right' });
        }
    }

    /*
    | Per-installment total: what this month actually costs the nasabah.
    | KASBON starts life as NULL (see Kredit@addKredit) and the number input yields
    | null when cleared, so both sides are coerced before adding.
    */
    function totalCicilan(detail:any):number {
        return Number(detail.NOMINAL ?? 0) + Number(detail.KASBON ?? 0);
    }

    async function showModal(ID:number){
        isModal = true;
        const doGet = await fetch(baseConfiguration.clientURL + 'Detail-Kredit/' + ID,{
            method: 'GET',
        });
        const doResponse = await doGet.json();
        modalData = doResponse.data;
    }

    async function changeMarketing(ID:number,status:string){
        const doPost = await fetch(baseConfiguration.clientURL + 'Ubah-Marketing',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                ID : ID,
                STATUS : status
            })
        });
        const doResponse = await doPost.json();
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
    
    async function changeKasbon(ID:number,amount:number){
        const doPost = await fetch(baseConfiguration.clientURL + 'Tambah-Kasbon',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                ID : ID,
                AMOUNT : amount
            })
        });
        const doResponse = await doPost.json();
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }

    async function changeLunas(ID:number,status:string){
        const doPost = await fetch(baseConfiguration.clientURL + 'Status-Lunas',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                ID : ID,
                STATUS : status
            })
        });
        const doResponse = await doPost.json();
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }

    function doDelete(ID:number){
        isDelete = true;
        id = ID;
        return id;
    }

    async function doErase(){
        const doPost = await fetch(baseConfiguration.clientURL + 'Hapus-Kredit',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                ID : id
            })
        });
        const doResponse = await doPost.json();
        doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
        let index:number = newData.findIndex((element: { ID: number; }) => element.ID === id);
        newData.splice(index,1);
        newData = newData;
        isModal = false;
        return newData;
    }

    async function setLunas(ID:number,STATUS:string){
        const doPost = await fetch(baseConfiguration.clientURL + 'Kredit-Lunas',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                ID : ID,
                STATUS : STATUS
            })
        });
        const doResponse = await doPost.json();
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
</script>
<svelte:head><title>Dashboard — Kosada</title></svelte:head>

<PageHeader title="Dashboard" description="Pinjaman aktif">
    <svelte:fragment slot="meta">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-base-300/60 px-2 py-0.5">
            {rangeLabel}
        </span>
        {#if isDefaultRange}
            <span class="opacity-70">2 bulan terakhir</span>
        {:else}
            <button type="button" class="link link-hover" on:click={resetRange}>
                Kembalikan ke 2 bulan terakhir
            </button>
        {/if}
        {#if meta.total > 0}
            <span aria-hidden="true">·</span>
            <span><strong class="text-base-content">{meta.total.toLocaleString('id-ID')}</strong> pinjaman</span>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="toolbar">
        <!--
          | A single compact row, not a five-field labelled grid. The filters used
          | to take a third of the screen above a table that is the whole point of
          | the page; placeholders carry the labelling instead.
        -->
        <form on:submit|preventDefault={applyFilters}
              class="px-4 lg:px-8 pb-3 flex flex-wrap items-center gap-2">
            <label class="input input-bordered input-sm flex items-center gap-2 grow max-w-xs">
                <Icon name="search" size={16} />
                <input id="cariNama" type="search" bind:value={form.nama}
                       placeholder="Cari nama nasabah" class="grow min-w-0" />
            </label>

            <MarketingSelect bind:value={form.kategori} includeSemua
                             class="select select-bordered select-sm" />

            <div class="flex items-center gap-1 text-sm">
                <input id="startDate" type="date" bind:value={form.date.start}
                       class="input input-bordered input-sm" aria-label="Tanggal mulai" />
                <span class="text-muted">—</span>
                <input id="endDate" type="date" bind:value={form.date.end}
                       class="input input-bordered input-sm" aria-label="Tanggal akhir" />
            </div>

            <button type="submit" class="btn btn-primary btn-sm" disabled={isLoading}>
                {#if isLoading}
                    <span class="loading loading-spinner loading-xs"></span> Mencari..
                {:else}
                    Cari
                {/if}
            </button>
        </form>
    </svelte:fragment>
</PageHeader>

<div class="px-4 lg:px-8 py-5">
    <Panel flush>
            <div class="overflow-x-auto max-h-[70vh]">
                <table class="table-kosada">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tanggal Pinjaman</th>
                            <th>Atas Nama</th>
                            <th>Data Marketing</th>
                            <th class="num">Nominal Pengajuan</th>
                            <th>Keterangan</th>
                            <th>Status</th>
                            <th class="text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if isLoading}
                            <SkeletonRows rows={6} columns={8} />
                        {:else if newData.length === 0}
                            <EmptyState
                                colspan={8}
                                subject="data pinjaman"
                                filtered={applied.nama !== '' || applied.kategori !== 'SEMUA' || !isDefaultRange} />
                        {/if}
                        {#each newData as data,index }
                            <tr>
                                <td class="text-muted">{ (meta.page - 1) * meta.per_page + index + 1 }</td>
                                <td class="whitespace-nowrap">{data.CREATED_AT}</td>
                                <td class="font-medium">{data.NAMA}</td>
                                <td><span class="badge badge-ghost badge-sm">{data.MARKETING}</span></td>
                                <td class="num">{ rupiahFormatter.format(data.JUMLAH_PENGAJUAN) }</td>
                                <td class="max-w-xs truncate" title={data.KETERANGAN ?? ''}>{data.KETERANGAN == null ? '-' : data.KETERANGAN}</td>
                                <td>
                                    <select bind:value={data.LUNAS} on:change={() => setLunas(data.ID,data.LUNAS)} class="select select-bordered select-sm">
                                        <option value="Yes">Belum Lunas</option>
                                        <option value="No">Sudah Lunas</option>
                                    </select>
                                </td>
                                <td>
                                    <div class="flex items-center justify-end gap-1">
                                        <button type="button" on:click={() => showModal(data.ID)}
                                            class="btn btn-ghost btn-sm" title="Lihat detail">
                                            <Icon name="detail" size={16} /> Detail
                                        </button>
                                        <button type="button" on:click={() => doDelete(data.ID)}
                                            class="btn btn-ghost btn-sm text-error" title="Hapus kredit" aria-label="Hapus kredit {data.NAMA}">
                                            <Icon name="trash" size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
        </div>

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
                    <button type="button" class="join-item btn btn-sm" disabled={meta.page <= 1 || isLoading} on:click={() => gotoPage(1)}>«</button>
                    <button type="button" class="join-item btn btn-sm" disabled={meta.page <= 1 || isLoading} on:click={() => gotoPage(meta.page - 1)}>‹</button>
                    <button type="button" class="join-item btn btn-sm">{meta.page}</button>
                    <button type="button" class="join-item btn btn-sm" disabled={meta.page >= meta.last_page || isLoading} on:click={() => gotoPage(meta.page + 1)}>›</button>
                    <button type="button" class="join-item btn btn-sm" disabled={meta.page >= meta.last_page || isLoading} on:click={() => gotoPage(meta.last_page)}>»</button>
                </div>
            </div>
        </div>
    </Panel>
</div>
<!--
  | The loan detail is a slide-over, not a centred modal. A half-width box could
  | not hold a six-column installment table without cramping it, and the list
  | behind stays visible so you don't lose your place in it.
-->
<Drawer bind:open={isModal} title={modalData.NAMA ?? 'Detail Pinjaman'} subtitle={modalData.ALAMAT ?? ''}>
    <!-- The two figures staff actually came here for, before any form fields. -->
    <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="rounded-lg border border-base-300 p-3">
            <p class="text-xs text-muted">Kasbon Belum Lunas</p>
            <p class="text-lg font-bold num">{rupiahFormatter.format(modalData.KASBON_BELUM_LUNAS ?? 0)}</p>
        </div>
        <div class="rounded-lg border border-base-300 p-3">
            <p class="text-xs text-muted">Angsuran Belum Lunas</p>
            <p class="text-lg font-bold num">{rupiahFormatter.format(modalData.TOTAL_BELUM_LUNAS ?? 0)}</p>
        </div>
    </div>

    <div class="grid sm:grid-cols-2 gap-4 mb-5">
        <div class="form-control">
            <label for="ubahMarketing" class="label"><span class="label-text">Data Marketing</span></label>
            <!-- No "SEMUA" here: this control WRITES the loan's marketing value. -->
            <MarketingSelect
                bind:value={modalData.MARKETING}
                class="select select-bordered select-sm w-full"
                on:change={(e) => changeMarketing(modalData.ID, e.detail)} />
        </div>

        <div class="form-control">
            <label for="keteranganPinjaman" class="label"><span class="label-text">Keterangan</span></label>
            <textarea id="keteranganPinjaman" class="textarea textarea-bordered textarea-sm h-[2.5rem]" readonly
                >{modalData.KETERANGAN ?? ''}</textarea>
        </div>
    </div>

    <h3 class="text-sm font-semibold mb-2">Angsuran</h3>
    <div class="overflow-x-auto rounded-lg border border-base-300">
        <table class="table-kosada">
            <thead>
                <tr>
                    <th>#</th>
                    <th class="num">Nominal</th>
                    <th>Jatuh Tempo</th>
                    <th class="num">Kasbon</th>
                    <th class="num">Total</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {#if modalData.DETAIL === undefined}
                    <tr><td colspan="6" class="text-center py-6 text-muted">Memuat angsuran..</td></tr>
                {:else}
                    {#each modalData.DETAIL as detail, index }
                        <tr>
                            <td class="whitespace-nowrap">
                                {#if detail.LUNAS == 'Belum'}
                                    <span class="text-muted">Cicilan {index + 1}</span>
                                {:else}
                                    <span class="inline-flex items-center gap-1 text-success">
                                        <Icon name="check" size={14} /> {index + 1}
                                    </span>
                                {/if}
                            </td>
                            <td class="num">{rupiahFormatter.format(detail.NOMINAL)}</td>
                            <td class="whitespace-nowrap">{detail.JATUH_TEMPO}</td>
                            <td>
                                <input type="number" bind:value={detail.KASBON}
                                    on:blur={() => changeKasbon(detail.ID,detail.KASBON)}
                                    placeholder="0" class="input input-bordered input-sm w-28 text-right"/>
                            </td>
                            <td class="num font-semibold">{rupiahFormatter.format(totalCicilan(detail))}</td>
                            <td>
                                <select bind:value={detail.LUNAS} on:change={() => changeLunas(detail.ID,detail.LUNAS)}
                                        class="select select-bordered select-sm" required>
                                    <option value="Sudah">Sudah Lunas</option>
                                    <option value="Belum">Belum Lunas</option>
                                </select>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    <svelte:fragment slot="footer">
        {#if sudahMacet}
            <span class="badge badge-error badge-outline">Sudah masuk Kredit Macet</span>
        {:else}
            <button type="button" class="btn btn-ghost btn-sm text-error" on:click={openMacet}>
                Tambahkan ke Kredit Macet
            </button>
        {/if}
        <a href="/dashboard/report/{modalData.ID}" target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">
            <Icon name="print" size={16} /> Cetak
        </a>
    </svelte:fragment>
</Drawer>
<!-- Register this loan as Kredit Macet. Only the reason is typed; every amount on
     the Data Macet page is computed from live angsuran data. -->
<div class="modal" class:modal-open={isMacet}>
    <form method="dialog" class="modal-box">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={() => isMacet = false}>✕</button>
        <h2 class="card-title">Tambahkan ke Kredit Macet</h2>
        <p class="py-2">
            Menambahkan <strong>{modalData.NAMA}</strong> ke daftar kredit macet.
            Pinjaman ini tetap tampil di Dashboard dan Laporan.
        </p>
        <div class="form-control">
            <label for="alasanMacet" class="label">
                <span class="label-text">Alasan / keterangan kredit macet</span>
            </label>
            <textarea id="alasanMacet" bind:value={alasanMacet} class="textarea textarea-bordered h-24"
                placeholder="Contoh: nasabah pindah kerja, 6 bulan tidak ada pembayaran"></textarea>
        </div>
        <div class="card-actions justify-end mt-4">
            <button type="button" class="btn btn-error" on:click={doTambahMacet}>Simpan</button>
            <button type="button" class="btn btn-ghost" on:click={() => isMacet = false}>Batalkan</button>
        </div>
    </form>
</div>

<!-- Delete?? -->
<div class="modal" class:modal-open={isDelete}>
    <form method="dialog" class="modal-box">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={ () => isDelete = false }>✕</button>
        <h2 class="card-title">Peringatan!</h2>
        <p>Kredit akan dihapus!</p>
        <div class="card-actions justify-end">
            <button type="button" on:click={doErase} class="btn btn-error">Ya, Hapus</button>
            <button type="button" on:click={() => isDelete = false} class="btn btn-ghost">Batalkan</button>
        </div>
    </form>
</div>