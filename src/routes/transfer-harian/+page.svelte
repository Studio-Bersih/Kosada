<script lang="ts">
    import { onMount } from 'svelte';
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from '$lib/baseConfig';
    import { rupiahFormatter } from '$lib/formatter';
    import Header from '../features/Header.svelte';

    const JENIS = ['Kasbon','Top Up','Pinjaman Baru'];

    function hariIni(){
        const d = new Date();
        const pad = (n:number) => String(n).padStart(2,'0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    }

    let tanggal:string = hariIni();
    let rows:any = [];
    let meta:any = { total : 0, total_nominal : 0, page : 1, per_page : 50, last_page : 1 };
    let isLoading = false;

    // --- entry form ---------------------------------------------------------
    let cariNama:string      = '';
    let hasilCari:any        = [];
    let memberTerpilih:any   = null;
    let pinjaman:any         = [];
    let kreditTerpilih:any   = null;
    let jenis:string         = 'Kasbon';
    let nominal:number|null  = null;
    let keterangan:string    = '';
    let isSaving             = false;

    async function load(){
        isLoading = true;
        try {
            const doGet = await fetch(baseConfiguration.clientURL + 'Transfer-Harian?tanggal=' + tanggal, { method : 'GET' });
            const doResponse = await doGet.json();
            rows = doResponse.data ?? [];
            meta = doResponse.meta ?? meta;
        } catch {
            toast.error('Ada masalah pada server', { position : 'top-right' });
        }
        isLoading = false;
    }

    onMount(load);

    let cariTimer:ReturnType<typeof setTimeout>;
    function onCariInput(){
        clearTimeout(cariTimer);
        cariTimer = setTimeout(doCari, 300);
    }

    async function doCari(){
        if(!cariNama.trim()){
            hasilCari = [];
            return;
        }
        const doGet = await fetch(baseConfiguration.clientURL + 'Transfer-Harian/Cari-Member?nama=' + encodeURIComponent(cariNama), { method : 'GET' });
        hasilCari = await doGet.json();
    }

    async function pilihMember(m:any){
        memberTerpilih = m;
        hasilCari      = [];
        cariNama       = m.NAMA;
        kreditTerpilih = null;

        const doGet = await fetch(baseConfiguration.clientURL + 'Transfer-Harian/Kredit-Member/' + m.ID, { method : 'GET' });
        pinjaman = await doGet.json();

        // Nasabah often have several active loans, so the right one is picked
        // explicitly rather than guessed. Only auto-select when there is no choice.
        if(pinjaman.length === 1){
            kreditTerpilih = pinjaman[0];
            isiNominal();
        }
    }

    /*
    | Auto-fill from the chosen loan:
    |   Kasbon        -> that loan's kasbon
    |   Pinjaman Baru -> its jumlah pengajuan
    |   Top Up        -> manual, so left alone
    | The field stays editable in every case.
    */
    function isiNominal(){
        if(jenis === 'Top Up' || !kreditTerpilih) return;
        if(jenis === 'Kasbon')        nominal = kreditTerpilih.KASBON ?? 0;
        if(jenis === 'Pinjaman Baru') nominal = kreditTerpilih.JUMLAH_PENGAJUAN ?? 0;
    }

    function resetForm(){
        cariNama = ''; hasilCari = []; memberTerpilih = null;
        pinjaman = []; kreditTerpilih = null;
        jenis = 'Kasbon'; nominal = null; keterangan = '';
    }

    async function simpan(){
        if(!cariNama.trim())          return toast.error('Nama nasabah wajib diisi', { position : 'top-right' });
        if(nominal === null || nominal < 0) return toast.error('Nominal wajib diisi', { position : 'top-right' });

        isSaving = true;
        try {
            const doPost = await fetch(baseConfiguration.clientURL + 'Tambah-Transfer',{
                method  : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify({
                    TANGGAL_TRANSFER : tanggal,
                    MEMBER_ID        : memberTerpilih?.ID ?? null,
                    KREDIT_ID        : kreditTerpilih?.ID ?? null,
                    NAMA             : memberTerpilih?.NAMA ?? cariNama,
                    INSTANSI         : memberTerpilih?.PEKERJAAN ?? null,
                    JENIS            : jenis,
                    NOMINAL          : nominal,
                    KETERANGAN       : keterangan
                })
            });
            const doResponse = await doPost.json();

            if(doResponse.status == 'success'){
                toast.success(doResponse.message, { position : 'top-right' });
                resetForm();
                await load();
            } else {
                toast.error(doResponse.message ?? 'Gagal menyimpan', { position : 'top-right' });
            }
        } catch {
            toast.error('Ada masalah pada server', { position : 'top-right' });
        }
        isSaving = false;
    }

    async function hapus(ID:number){
        const doPost = await fetch(baseConfiguration.clientURL + 'Hapus-Transfer',{
            method  : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body    : JSON.stringify({ ID : ID })
        });
        const doResponse = await doPost.json();
        doResponse.status == 'success'
            ? toast.success(doResponse.message, { position : 'top-right' })
            : toast.error(doResponse.message ?? 'Gagal menghapus', { position : 'top-right' });
        await load();
    }

    $: printHref = '/transfer-harian/print?tanggal=' + tanggal;
    $: adaTerlambat = rows.some((r:any) => r.TERLAMBAT);
</script>
<Toaster />
<Header />
<div class="container mx-auto">
    <div class="card w-full bg-base-100 shadow-xl my-10">
        <div class="card-body">

            <!-- The date sits above the table, centered and outside the columns. -->
            <div class="text-center">
                <h2 class="text-xl font-bold">Data Transfer Harian</h2>
                <div class="flex justify-center items-center gap-2 mt-2">
                    <input type="date" bind:value={tanggal} on:change={load} class="input input-bordered w-auto"/>
                    <a href={printHref} target="_blank" rel="noreferrer" class="btn btn-primary btn-sm">Cetak</a>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Entry form -->
            <div class="bg-base-200 rounded-box p-4">
                <h3 class="font-bold mb-3">Tambah Data Transfer</h3>
                <div class="grid gap-3 md:grid-cols-3">

                    <div class="form-control relative">
                        <label for="cariNasabah" class="label"><span class="label-text">Cari Nasabah</span></label>
                        <input id="cariNasabah" type="search" bind:value={cariNama} on:input={onCariInput}
                            placeholder="Ketik nama nasabah.." class="input input-bordered" autocomplete="off"/>
                        {#if hasilCari.length > 0}
                            <ul class="menu bg-base-100 rounded-box shadow absolute top-full left-0 right-0 z-20 max-h-60 overflow-y-auto">
                                {#each hasilCari as m}
                                    <li>
                                        <button type="button" on:click={() => pilihMember(m)}>
                                            {m.NAMA}<span class="opacity-60 text-xs">{m.PEKERJAAN}</span>
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                        {#if memberTerpilih}
                            <span class="label-text-alt mt-1 opacity-70">Instansi: {memberTerpilih.PEKERJAAN || '-'}</span>
                        {/if}
                    </div>

                    <div class="form-control">
                        <label for="pilihPinjaman" class="label"><span class="label-text">Pinjaman</span></label>
                        <select id="pilihPinjaman" bind:value={kreditTerpilih} on:change={isiNominal} class="select select-bordered" disabled={pinjaman.length === 0}>
                            <option value={null}>
                                {pinjaman.length === 0 ? 'Pilih nasabah dulu' : 'Pilih pinjaman'}
                            </option>
                            {#each pinjaman as p}
                                <option value={p}>
                                    {p.CREATED_AT} — {rupiahFormatter.format(p.JUMLAH_PENGAJUAN)}
                                </option>
                            {/each}
                        </select>
                        {#if memberTerpilih && pinjaman.length === 0}
                            <span class="label-text-alt mt-1">Tidak ada pinjaman aktif. Nominal diisi manual.</span>
                        {/if}
                    </div>

                    <div class="form-control">
                        <label for="pilihJenis" class="label"><span class="label-text">Keterangan (Jenis)</span></label>
                        <select id="pilihJenis" bind:value={jenis} on:change={isiNominal} class="select select-bordered">
                            {#each JENIS as j}
                                <option value={j}>{j}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-control">
                        <label for="inputNominal" class="label">
                            <span class="label-text">Uang yang harus ditransfer</span>
                        </label>
                        <input id="inputNominal" type="number" bind:value={nominal} placeholder="0" class="input input-bordered"/>
                        {#if jenis === 'Top Up'}
                            <span class="label-text-alt mt-1">Top Up diisi manual.</span>
                        {/if}
                    </div>

                    <div class="form-control md:col-span-2">
                        <label for="inputKeterangan" class="label"><span class="label-text">Keterangan</span></label>
                        <input id="inputKeterangan" type="text" bind:value={keterangan} placeholder="Catatan tambahan (opsional)" class="input input-bordered"/>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" class="btn btn-ghost" on:click={resetForm}>Bersihkan</button>
                    <button type="button" class="btn btn-accent" on:click={simpan} disabled={isSaving}>
                        {#if isSaving}
                            <span class="loading loading-spinner loading-sm"></span> Menyimpan..
                        {:else}
                            Simpan
                        {/if}
                    </button>
                </div>
            </div>

            {#if adaTerlambat}
                <div class="alert alert-error mt-4">
                    <span>
                        Baris berwarna merah diinput di hari yang berbeda dari tanggal transfernya.
                    </span>
                </div>
            {/if}

            <div class="overflow-x-auto mt-4">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Keterangan (Jenis)</th>
                            <th>Instansi</th>
                            <th class="text-right">Uang Ditransfer</th>
                            <th>Keterangan</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if isLoading}
                            <tr><td colspan="7" class="text-center py-6">Memuat data..</td></tr>
                        {:else if rows.length === 0}
                            <tr><td colspan="7" class="text-center py-6">Belum ada data transfer pada tanggal ini.</td></tr>
                        {:else}
                            {#each rows as row, index}
                                <tr class:bg-error={row.TERLAMBAT} class:text-error-content={row.TERLAMBAT}
                                    title={row.TERLAMBAT ? `Diinput pada ${row.DIINPUT_PADA} untuk tanggal ${row.TANGGAL_TAMPIL}` : ''}>
                                    <td>{index + 1}</td>
                                    <td>{row.NAMA}</td>
                                    <td>{row.JENIS}</td>
                                    <td>{row.INSTANSI}</td>
                                    <td class="text-right whitespace-nowrap">{rupiahFormatter.format(row.NOMINAL)}</td>
                                    <td>{row.KETERANGAN ?? '-'}</td>
                                    <td>
                                        <button type="button" class="btn btn-xs btn-ghost" on:click={() => hapus(row.ID)}>Hapus</button>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                    {#if rows.length > 0}
                        <tfoot>
                            <tr class="font-bold">
                                <td colspan="4">Total ({meta.total} data)</td>
                                <td class="text-right">{rupiahFormatter.format(meta.total_nominal)}</td>
                                <td colspan="2"></td>
                            </tr>
                        </tfoot>
                    {/if}
                </table>
            </div>

        </div>
    </div>
</div>
