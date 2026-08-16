<script lang="ts">
    import Header from "../features/Header.svelte";
    import MarketingSelect from "$lib/MarketingSelect.svelte";
    import { initializeDate, rupiahFormatter } from "$lib/formatter";
    import { baseConfiguration } from "$lib/baseConfig";
    import toast, { Toaster } from 'svelte-french-toast';
    import { onMount } from "svelte";

    // export let data;

    let newData:any             = [];
    let currentCategory:string  = 'SEMUA';
    let currentNama:string      = '';

    // Debounce the name box so typing doesn't fire a request per keystroke.
    let searchTimer:ReturnType<typeof setTimeout>;
    function onNamaInput(){
        clearTimeout(searchTimer);
        searchTimer = setTimeout(doPost, 300);
    }

    type Form = Record<"start" | "end", string>;
    let useDate: Form = {
        start: initializeDate("first"),
        end: initializeDate("last")
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
        const doPost = await fetch(baseConfiguration.clientURL + 'Realisasi-Kredit-Range', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                start: useDate.start,
                end: useDate.end,
                kategori: currentCategory,
                nama: currentNama
            })
        });

        isLoading = false;

        const doResponse = await doPost.json();
        newData = doResponse;
        newData = newData;

        await loadStatusMacet();
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
            macetIDs = await doPost.json();
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
<Toaster />
<Header />
<div class="container mx-auto my-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            
            <form on:submit|preventDefault={doPost} class="flex justify-between">
                <div class="form-control w-full max-w-md">
                    <label for="cariNama" class="label">
                        <span class="label-text">Cari Nama</span>
                    </label>
                    <input
                        id="cariNama"
                        type="search"
                        bind:value={currentNama}
                        on:input={onNamaInput}
                        placeholder="Ketik nama nasabah.."
                        class="input input-bordered max-w-xs"/>
                </div>

                <div class="form-control w-full max-w-md">
                    <label for="pilihKategori" class="label">
                        <span class="label-text">Pilih Kategori</span>
                    </label>
                    <MarketingSelect bind:value={currentCategory} includeSemua />
                </div>

                <div class="form-control w-full max-w-md">
                    <label for="startDate" class="label">
                        <span class="label-text">Tanggal Mulai Pinjaman</span>
                    </label>
                    <input type="date" bind:value={useDate.start} class="input"/>
                </div>

                <div class="form-control w-full max-w-md">
                    <label for="end" class="label">
                        <span class="label-text">Tanggal Akhir Pinjaman</span>
                    </label>
                    <input type="date" bind:value={useDate.end} class="input"/>
                </div>

                <div class="form-control w-full max-w-md">
                    <label for="end" class="label">
                        <span class="label-text">Pencarian</span>
                    </label>
                    <button type="submit" class="btn btn-primary" disabled={isLoading}>
                        {#if isLoading}
                            <span class="loading loading-spinner loading-sm"></span> Mencari..
                        {:else}
                            <span>Mulai Pencarian</span>
                        {/if}
                    </button>
                </div>
            </form>

            <div class="overflow-x-auto my-5">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tanggal Pinjaman</th>
                            <th>Atas Nama</th>
                            <th>Data Marketing</th>
                            <th>Nominal Pengajuan</th>
                            <th>Keterangan</th>
                            <th>Detail</th>
                            <th>Hapus Kredit</th>
                            <th>Set Lunas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan=9 class="text-center">Tidak ada data.</td>
                            </tr>
                        {/if}
                        {#each newData as data,index }
                            <tr class="hover">
                                <td>{index + 1}</td>
                                <td>{data.CREATED_AT}</td>
                                <td>{data.NAMA}</td>
                                <td>{data.MARKETING}</td>
                                <td>{ rupiahFormatter.format(data.JUMLAH_PENGAJUAN) }</td>
                                <td>{data.KETERANGAN == null ? '-' : data.KETERANGAN}</td>
                                <td>
                                    <button type="button" on:click={() => showModal(data.ID)} class="btn btn-sm btn-accent rounded-full">Detail</button>
                                </td>
                                <td>
                                    <button type="button" on:click={() => doDelete(data.ID)} class="btn btn-sm btn-secondary">Hapus Kredit</button>
                                </td>
                                <td>
                                    <select bind:value={data.LUNAS} on:change={() => setLunas(data.ID,data.LUNAS)} class="select select-bordered w-full max-w-md">
                                        <option value="Yes">Belum Lunas</option>
                                        <option value="No">Sudah Lunas</option>
                                    </select>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>
<!-- Open the modal using ID.showModal() method -->
<div class="modal" class:modal-open={isModal}>
    <form method="dialog" class="modal-box max-w-none w-1/2">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={ () => isModal = false }>✕</button>
        <a href="/dashboard/report/{modalData.ID}" target="_blank" class="btn btn-primary my-2 ms-2">Cetak Halaman Pinjaman</a>

        {#if sudahMacet}
            <span class="badge badge-error badge-lg my-2 ms-2">Sudah masuk Kredit Macet</span>
        {:else}
            <button type="button" class="btn btn-error my-2 ms-2" on:click={openMacet}>
                Tambahkan ke Kredit Macet
            </button>
        {/if}

        <h1 class="mt-5">Kasbon Belum Lunas: { rupiahFormatter.format(modalData.KASBON_BELUM_LUNAS) }</h1>
        <h1>Angsuran Belum Lunas: { rupiahFormatter.format(modalData.TOTAL_BELUM_LUNAS) }</h1>
        <div class="divider"></div>

        <div id="modalContent" class="grid grid-cols-2 place-items-center gap-2 my-5">
            <div class="form-control w-full max-w-md">
                <label for="inputName" class="label">
                    <span class="label-text">Nama Nasabah</span>
                </label>
                <input type="text" value="{modalData.NAMA}" placeholder="Masukkan Nama" class="input input-bordered w-full max-w-md" disabled/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputAlamat" class="label">
                    <span class="label-text">Alamat Nasabah</span>
                </label>
                <input type="text" value="{modalData.ALAMAT}" placeholder="Masukkan Alamat" class="input input-bordered w-full max-w-md" disabled/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="ubahMarketing" class="label">
                    <span class="label-text">Ubah Data Marketing</span>
                </label>
                <!-- No "SEMUA" here: this control WRITES the loan's marketing value. -->
                <MarketingSelect
                    bind:value={modalData.MARKETING}
                    on:change={(e) => changeMarketing(modalData.ID, e.detail)} />
            </div>

            <div class="form-control w-full max-w-md">
                <label for="keteranganPinjaman" class="label">
                    <span class="label-text">Keterangan</span>
                </label>
                <textarea class="textarea textarea-bordered h-24" placeholder="Keterangan" readonly>{modalData.KETERANGAN}</textarea>
            </div>

        </div>

        <div class="overflow-auto">
            <table class="table">
                <thead class="font-bold">
                    <th>#</th>
                    <th>Nominal</th>
                    <th>Jatuh Tempo</th>
                    <th>Kasbon</th>
                    <th>Total</th>
                    <th>Status Lunas</th>
                </thead>
                <tbody>
                    {#if modalData.DETAIL === undefined}
                        <tr>
                            <td>No Data</td>
                        </tr>
                    {:else}
                        {#each modalData.DETAIL as detail, index }
                            <tr class="hover">
                                <td>
                                    {#if detail.LUNAS == 'Belum'}
                                        <button type="button" class="btn btn-sm btn-ghost w-full">Cicilan ke - {index + 1}</button>
                                    {:else}
                                        <button type='button' class='btn btn-sm btn-accent w-full'>Lunas ✔</button>
                                    {/if}
                                </td>
                                <td>{rupiahFormatter.format(detail.NOMINAL)}</td>
                                <td>{detail.JATUH_TEMPO}</td>
                                <td><input type="number" bind:value="{detail.KASBON}" on:blur={() => changeKasbon(detail.ID,detail.KASBON)} placeholder="Kasbon" class="input input-bordered w-full max-w-md"/></td>
                                <td class="font-bold whitespace-nowrap">{rupiahFormatter.format(totalCicilan(detail))}</td>
                                <td>
                                    <select bind:value={detail.LUNAS} on:change={() => changeLunas(detail.ID,detail.LUNAS)} class="select select-bordered w-full max-w-md" required>
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
    </form>
</div>
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
            <button type="button" on:click={doErase} class="btn btn-secondary">Ya, Hapus</button>
            <button type="button" on:click={() => isDelete = false} class="btn btn-ghost">Batalkan</button>
        </div>
    </form>
</div>