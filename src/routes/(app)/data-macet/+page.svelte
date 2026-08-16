<script lang="ts">
    import { onMount } from 'svelte';
    import toast from '$lib/toast';
    import { baseConfiguration } from '$lib/baseConfig';
    import { rupiahFormatter } from '$lib/formatter';
    import MarketingSelect from '$lib/MarketingSelect.svelte';
    import { normalizeList } from '$lib/apiList';
    import PageHeader from '$lib/PageHeader.svelte';
    import { getAccount, isAdmin, type KosadaAccount } from '$lib/session';
    import Panel from '$lib/Panel.svelte';
    import Icon from '$lib/Icon.svelte';

    let rows:any = [];
    let meta:any = { page : 1, per_page : 25, total : 0, last_page : 1 };
    let isLoading = false;

    let page:number        = 1;

    /*
    | `form` is what the user is typing, `applied` is what the table is showing.
    | Nothing queries until the form is submitted; paging reads `applied`.
    */
    let form    = { nama : '', marketing : 'SEMUA', status : 'Macet' };
    let applied = { nama : '', marketing : 'SEMUA', status : 'Macet' };

    /*
    | Resolving a case is Administrator-only. The disabled button is the visible
    | half; Macet@selesaiMacet re-verifies an administrator's password on the
    | request, so a Staff account cannot close a case by any route.
    |
    | The password field lives in this same dialog rather than a second one — the
    | reason and the confirmation are one decision, and two stacked modals for a
    | single action is worse than the thing it guards.
    */
    let isSelesai:boolean      = false;
    let selesaiTarget:any      = null;
    let alasanSelesai:string   = '';
    let adminPassword:string   = '';
    let isSelesaiBusy          = false;
    let account:KosadaAccount | null = null;
    let admin = false;

    async function load(){
        isLoading = true;
        const params = new URLSearchParams({
            status   : applied.status,
            page     : String(page),
            per_page : String(meta.per_page)
        });
        if(applied.nama) params.set('nama', applied.nama);
        if(applied.marketing && applied.marketing !== 'SEMUA') params.set('marketing', applied.marketing);

        try {
            const doGet = await fetch(baseConfiguration.clientURL + 'Data-Macet?' + params.toString(), { method : 'GET' });
            const list = normalizeList(await doGet.json(), {
                page    : page,
                perPage : meta.per_page,
                label   : 'Data-Macet'
            });
            rows = list.data;
            meta = list.meta;
        } catch {
            toast.error('Ada masalah pada server', { position : 'top-right' });
        }
        isLoading = false;
    }

    onMount(() => {
        account = getAccount();
        admin   = isAdmin(account);
        load();
    });

    // Runs only on submit — this page no longer filters as you type.
    function applyFilters(){
        applied = { ...form };
        page = 1;
        return load();
    }

    function gotoPage(n:number){
        if(n < 1 || n > meta.last_page) return;
        page = n;
        load();
    }

    function openSelesai(row:any){
        selesaiTarget = row;
        alasanSelesai = '';
        adminPassword = '';
        isSelesai     = true;
    }

    async function doSelesai(){
        if(!alasanSelesai.trim()) return toast.error('Alasan penyelesaian wajib diisi');
        if(!adminPassword)        return toast.error('Password administrator wajib diisi');

        isSelesaiBusy = true;
        try {
            const doPost = await fetch(baseConfiguration.clientURL + 'Selesai-Macet',{
                method  : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify({
                    ID             : selesaiTarget.ID,
                    ALASAN_SELESAI : alasanSelesai,
                    ADMIN_EMAIL    : account?.email ?? '',
                    ADMIN_PASSWORD : adminPassword
                })
            });
            const doResponse = await doPost.json();

            if(doResponse.status == 'success'){
                toast.success(doResponse.message);
                isSelesai = false;
                await load();
            } else {
                toast.error(doResponse.message ?? 'Gagal menyimpan');
            }
        } catch {
            toast.error('Ada masalah pada server');
        }
        isSelesaiBusy = false;
    }

    // Built from `applied`, so the printout matches the table on screen rather
    // than whatever half-typed filters are sitting in the form.
    $: printHref = '/data-macet/print?' + new URLSearchParams({
        status    : applied.status,
        marketing : applied.marketing,
        nama      : applied.nama
    }).toString();

    $: totalTagihan = rows.reduce((s:number, r:any) => s + Number(r.TOTAL_TAGIHAN ?? 0), 0);
</script>
<svelte:head><title>Data Macet — Kosada</title></svelte:head>

<PageHeader
    title="Data Kredit Macet"
    description="Satu baris per pinjaman · nominal dihitung langsung dari data angsuran">
    <svelte:fragment slot="meta">
        {#if meta.total > 0}
            <span aria-hidden="true">·</span>
            <span><strong class="text-base-content">{meta.total.toLocaleString('id-ID')}</strong> kasus</span>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <a href={printHref} target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">
            <Icon name="print" size={16} /> Cetak
        </a>
    </svelte:fragment>

    <svelte:fragment slot="toolbar">
        <form on:submit|preventDefault={applyFilters}
              class="px-4 lg:px-8 pb-3 flex flex-wrap items-center gap-2">
            <label class="input input-bordered input-sm flex items-center gap-2 grow max-w-xs">
                <Icon name="search" size={16} />
                <input id="cariNama" type="search" bind:value={form.nama}
                       placeholder="Cari nama nasabah" class="grow min-w-0"/>
            </label>

            <MarketingSelect bind:value={form.marketing} includeSemua class="select select-bordered select-sm" />

            <select id="pilihStatus" bind:value={form.status} class="select select-bordered select-sm">
                <option value="Macet">Masih Macet</option>
                <option value="Selesai">Sudah Selesai</option>
                <option value="SEMUA">Semua Status</option>
            </select>

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
                            <th>Nama</th>
                            <th class="text-right">Total Pinjaman</th>
                            <th class="text-right">Sisa Angsuran</th>
                            <th class="text-right">Penalti (30%)</th>
                            <th class="text-right">Total Tagihan</th>
                            <th>Pekerjaan / Instansi</th>
                            <th>Alamat</th>
                            <th>Keterangan</th>
                            <th>Alasan Macet</th>
                            <th>WhatsApp</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if isLoading}
                            <tr><td colspan="12" class="text-center py-6">Memuat data..</td></tr>
                        {:else if rows.length === 0}
                            <tr><td colspan="12" class="text-center py-6">Tidak ada data kredit macet.</td></tr>
                        {:else}
                            {#each rows as row, index}
                                <tr class="hover">
                                    <td>{ (meta.page - 1) * meta.per_page + index + 1 }</td>
                                    <td class="font-medium whitespace-nowrap">
                                        {row.NAMA}
                                        {#if row.STATUS === 'Selesai'}
                                            <span class="badge badge-success badge-sm ms-1">Selesai</span>
                                        {/if}
                                    </td>
                                    <td class="text-right whitespace-nowrap">{rupiahFormatter.format(row.TOTAL_PINJAMAN)}</td>
                                    <td class="text-right whitespace-nowrap">{rupiahFormatter.format(row.SISA_ANGSURAN)}</td>
                                    <td class="text-right whitespace-nowrap">{rupiahFormatter.format(row.PENALTI)}</td>
                                    <td class="text-right whitespace-nowrap font-bold">{rupiahFormatter.format(row.TOTAL_TAGIHAN)}</td>
                                    <td>{row.PEKERJAAN}</td>
                                    <td>{row.ALAMAT}</td>
                                    <td>{row.KETERANGAN ?? '-'}</td>
                                    <td>{row.ALASAN_MACET}</td>
                                    <td>
                                        {#if row.WHATSAPP && row.WHATSAPP !== '-'}
                                            <a href="https://wa.me/{row.WHATSAPP}" target="_blank" rel="noreferrer" class="link link-primary">
                                                {row.WHATSAPP}
                                            </a>
                                        {:else}
                                            -
                                        {/if}
                                    </td>
                                    <td>
                                        {#if row.STATUS === 'Macet'}
                                            <button
                                                type="button"
                                                class="btn btn-xs btn-ghost"
                                                disabled={!admin}
                                                title={admin ? 'Tandai kasus ini selesai' : 'Hanya Administrator yang dapat menyelesaikan kasus'}
                                                on:click={() => openSelesai(row)}>
                                                Selesai
                                            </button>
                                        {:else}
                                            <span class="text-xs opacity-60">{row.TANGGAL_SELESAI}</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                    {#if rows.length > 0}
                        <tfoot>
                            <tr class="font-bold">
                                <td colspan="5">Total tagihan halaman ini</td>
                                <td class="text-right">{rupiahFormatter.format(totalTagihan)}</td>
                                <td colspan="6"></td>
                            </tr>
                        </tfoot>
                    {/if}
                </table>
            </div>

            <div class="flex justify-between items-center border-t border-base-300 px-4 py-3">
                <span class="text-sm text-muted">
                    {meta.total.toLocaleString('id-ID')} data · halaman {meta.page} dari {meta.last_page}
                </span>
                <div class="join">
                    <button type="button" class="join-item btn btn-sm" disabled={meta.page <= 1} on:click={() => gotoPage(meta.page - 1)}>«</button>
                    <button type="button" class="join-item btn btn-sm">{meta.page}</button>
                    <button type="button" class="join-item btn btn-sm" disabled={meta.page >= meta.last_page} on:click={() => gotoPage(meta.page + 1)}>»</button>
                </div>
            </div>
    </Panel>
</div>

<!-- Resolve a case. The record is kept, never deleted. -->
<div class="modal" class:modal-open={isSelesai}>
    <form method="dialog" class="modal-box">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={() => isSelesai = false}>✕</button>
        <h2 class="card-title">Selesaikan Data Macet</h2>
        {#if selesaiTarget}
            <p class="py-2">
                Menandai <strong>{selesaiTarget.NAMA}</strong> sebagai selesai.
                Datanya tidak dihapus — tetap tersimpan sebagai riwayat.
            </p>
        {/if}
        <div class="form-control">
            <label for="alasanSelesai" class="label">
                <span class="label-text">Alasan / keterangan penyelesaian</span>
            </label>
            <textarea id="alasanSelesai" bind:value={alasanSelesai} class="textarea textarea-bordered h-24"
                placeholder="Contoh: nasabah sudah melunasi seluruh tunggakan"></textarea>
        </div>
        <div class="form-control mt-3">
            <label for="adminPassword" class="label">
                <span class="label-text">Password Administrator{account?.email ? ` (${account.email})` : ''}</span>
            </label>
            <input id="adminPassword" type="password" bind:value={adminPassword}
                   class="input input-bordered" placeholder="Masukkan password Anda"
                   autocomplete="current-password"/>
            <span class="label-text-alt mt-1">
                Server memverifikasi password ini dan memastikan akun Anda Administrator.
            </span>
        </div>

        <div class="card-actions justify-end mt-4">
            <button type="button" class="btn btn-ghost btn-sm" on:click={() => isSelesai = false}>Batalkan</button>
            <button type="button" class="btn btn-primary btn-sm" on:click={doSelesai} disabled={isSelesaiBusy}>
                {#if isSelesaiBusy}
                    <span class="loading loading-spinner loading-xs"></span> Memproses..
                {:else}
                    Simpan
                {/if}
            </button>
        </div>
    </form>
</div>
