<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from "$lib/baseConfig";
    import { rupiahFormatter } from "$lib/formatter";
    import Header from "../features/Header.svelte";

    export let data;
    let newData:any             = data.data;
    let staticData:any          = newData;
    let currentCategory:string  = 'SEMUA';

    let isModal:boolean         = false;
    let modalData:any           = [];

    async function showModal(ID:number){
        isModal = true;
        const doGet = await fetch(baseConfiguration.defaultURL + 'Detail-Kredit/' + ID);
        const doResponse = await doGet.json();
        modalData = doResponse.data;
        console.log(modalData)
    }

    function changeCategory(ID:string){
        newData             = staticData;
        const dataFilter    = newData.filter((kategoriData:any) => kategoriData.MARKETING == ID );
        newData             = dataFilter
        if(ID == 'SEMUA'){
            newData = staticData;
        }
        newData = newData;
        return newData
    }
    
    async function changeKasbon(ID:number,amount:number){
        let kasbonAmount = amount as unknown as HTMLInputElement;
        console.log(ID,Number(kasbonAmount.value));
        // Udah fix, tinggal async aja
    }

    async function changeLunas(ID:number,status:string){
        // Udah fix, tinggal async aja
        console.log(ID,status);
    }

    async function hapusPinjaman(ID:string){
        console.log(ID);
    }

    async function lunasiPinjaman(ID:string){
        console.log(ID);
    }


</script>
<Toaster />
<Header />
<div class="container mx-auto my-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            
            <div class="flex justify-between ...">
                <h2 class="card-title">Realisasi Kredit</h2>
                <select bind:value={currentCategory} on:change={() => changeCategory(currentCategory)} class="select select-info max-w-xs">
                    <option selected disabled>Pilih Data Marketing</option>
                    <option value="SEMUA">Tampilkan Semua Data</option>
                    <option value="TGL 25">TGL 25</option>
                    <option value="28 IM">28 IM</option>
                    <option value="28 AM">28 AM</option>
                    <option value="BCA 1">BCA 1</option>
                    <option value="BCA 2">BCA 2</option>
                    <option value="MAN 1">MAN 1</option>
                    <option value="MAN 2">MAN 2</option>
                    <option value="SAB/BRI">SAB/BRI</option>
                    <option value="CIMB">CIMB</option>
                    <option value="MJK">MJK</option>
                    <option value="YAKULT">YAKULT</option>
                    <option value="OPPO">OPPO</option>
                    <option value="U.LOKA">U.LOKA</option>
                    <option value="BNI">BNI</option>
                    <option value="JATIM">JATIM</option>
                </select>
              </div>

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
                        </tr>
                    </thead>
                    <tbody>
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
        <button type="button" on:click={() => hapusPinjaman(modalData.NO_KREDIT)} class="btn btn-secondary my-2 ms-2">Hapus Data Kredit</button>
        <button type="button" on:click={() => lunasiPinjaman(modalData.NO_KREDIT)} class="btn btn-info my-2 ms-2">Lunasi Pinjaman</button>
        <a href="/dashboard/report/{modalData.ID}" target="_blank" class="btn btn-primary my-2 ms-2">Cetak Halaman Pinjaman</a>
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
        </div>

        <div class="overflow-auto">
            <table class="table">
                <thead class="font-bold">
                    <th>#</th>
                    <th>Nominal</th>
                    <th>Jatuh Tempo</th>
                    <th>Kasbon</th>
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
                                <td><input type="number" bind:this="{detail.KASBON}" on:blur={() => changeKasbon(detail.ID,detail.KASBON)} placeholder="Kasbon" class="input input-bordered w-full max-w-md"/></td>
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