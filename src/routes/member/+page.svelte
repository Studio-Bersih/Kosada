<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from "$lib/baseConfig";
    import Header from "../features/Header.svelte";
    export let data;
    let newData:any = data.data;
    let currentCategory:string  = 'SEMUA';
    let staticData:any          = newData;

    let isModal:boolean     = false;
    let isDelete:boolean    = false;

    let id:number;
    let nama:string;
    let alamat:string;
    let kota:string;
    let provinsi:string;
    let whatsApp:number;
    let nomorKTP:number;
    let pinATM:number;
    let jenisKelamin:string;
    let dataMarketing:string;
    let pekerjaan:string;
    let rekomendasiDari:string;
    let keterangan:string;

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

    function doEdit(ID:number){
        isModal = true
        id              = newData[ID].ID;
        nama            = newData[ID].NAMA;
        alamat          = newData[ID].ALAMAT;
        kota            = newData[ID].KOTA;
        provinsi        = newData[ID].PROVINSI;
        whatsApp        = newData[ID].HP;
        nomorKTP        = newData[ID].KTP;
        pinATM          = newData[ID].PIN_ATM;
        jenisKelamin    = newData[ID].GENDER;
        dataMarketing   = newData[ID].MARKETING;
        pekerjaan       = newData[ID].PEKERJAAN;
        rekomendasiDari = newData[ID].REKOMENDASI;
        keterangan      = newData[ID].KETERANGAN;
    }

    function doDelete(ID:number){
        isDelete = true;
        id = newData[ID].ID;
    }

    async function doErase(){
        const doPost = await fetch(baseConfiguration.defaultURL + 'Hapus-Member',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            credentials : 'include',
            body : JSON.stringify({
                ID : id
            })
        });
        const doResponse = await doPost.json();
        return doResponse == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }

    async function doUpdate(){
        const doPost = await fetch(baseConfiguration.defaultURL + 'Tambah-Member',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            credentials : 'include',
            body : JSON.stringify({
                ID          : id,
                NAMA        : nama,
                ALAMAT      : alamat,
                KOTA        : kota,
                PROVINSI    : provinsi,
                WHATSAPP    : whatsApp,
                KTP         : nomorKTP,
                PIN         : pinATM,
                GENDER      : jenisKelamin,
                MARKETING   : dataMarketing,
                PEKERJAAN   : pekerjaan,
                REKOMENDASI : rekomendasiDari,
                KETERANGAN  : keterangan
            })
        });
        const doResponse = await doPost.json();
        return doResponse == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
</script>
<Toaster />
<Header/>
<div class="container mx-auto">

    <div class="flex justify-between my-5">
        <h2 class="card-title">Member Koperasi Kosada</h2>
        <select bind:value={currentCategory} on:change={() => changeCategory(currentCategory)} class="select select-info max-w-xs">
            <option selected disabled>Pilih Data Marketing</option>
            <option value="SEMUA">Tampilkan Semua Member</option>
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

    <div class="card w-full bg-base-100 shadow-xl">
        <div class="card-body">
            <div class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Alamat</th>
                            <th>Kota</th>
                            <th>WhatsApp</th>
                            <th>Registrasi</th>
                            <th>Keterangan</th>
                            <th>Marketing</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each newData as data,index }
                            <tr>
                                <td>{index + 1}</td>
                                <td>{data.NAMA}</td>
                                <td>{data.ALAMAT}</td>
                                <td>{data.KOTA}</td>
                                <td>
                                    <a href="https://wa.me/{data.HP}" target="_blank" data-te-ripple-init data-te-ripple-color="light" class="mb-2 inline-block px-6 py-2.5 text-xs font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg rounded-full" style="background-color: #128c7e">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                        </svg>
                                    </a>
                                </td>
                                <td>{data.CREATED_AT}</td>
                                <td>{data.KETERANGAN == null ? '-' : data.KETERANGAN}</td>
                                <td>{data.MARKETING}</td>
                                <td>
                                    <div class="flex">
                                        <button type="button" on:click={() => doEdit(index)} class="btn btn-accent me-2">Edit</button>
                                        <button type="button" on:click={() => doDelete(index)} class="btn btn-secondary me-2">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="modal" class:modal-open={isModal}>
    <form method="dialog" class="modal-box max-w-none w-1/2">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={ () => isModal = false }>✕</button>
        <h2 class="font-bold">Ubah Data Member</h2>
        <form on:submit={doUpdate} class="grid grid-cols-2 place-items-center gap-2 my-5">
            <div class="form-control w-full max-w-md">
                <label for="inputName" class="label">
                    <span class="label-text">Nama</span>
                </label>
                <input type="text" bind:value={nama} placeholder="Masukkan Nama" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputAlamat" class="label">
                    <span class="label-text">Alamat</span>
                </label>
                <input type="text" bind:value={alamat} placeholder="Masukkan Alamat" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputKota" class="label">
                    <span class="label-text">Kota</span>
                </label>
                <input type="text" bind:value={kota} placeholder="Masukkan Kota" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputProvinsi" class="label">
                    <span class="label-text">Provinsi</span>
                </label>
                <select bind:value={provinsi} class="select select-bordered w-full max-w-md" required>
                    <option disabled selected>Pilih Provinsi</option>
                    {#each data.provinsi as provinsi }
                        <option value="{provinsi}">{provinsi}</option>
                    {/each}
                </select>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputHP" class="label">
                    <span class="label-text">WhatsApp</span>
                </label>
                <input type="number" bind:value={whatsApp} placeholder="Masukkan Telepon" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputKTP" class="label">
                    <span class="label-text">No KTP</span>
                </label>
                <input type="number" bind:value={nomorKTP} placeholder="Masukkan KTP" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputATM" class="label">
                    <span class="label-text">No PIN ATM</span>
                </label>
                <input type="number" bind:value={pinATM} placeholder="Masukkan PIN" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputGender" class="label">
                    <span class="label-text">Jenis Kelamin</span>
                </label>
                <select bind:value={jenisKelamin} class="select select-bordered w-full max-w-md" required>
                    <option disabled selected>Pilih Jenis Kelamin</option>
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                </select>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputMarketing" class="label">
                    <span class="label-text">Data Marketing</span>
                </label>
                <select bind:value={dataMarketing} class="select select-bordered w-full max-w-md" required>
                    <option disabled selected>Pilih Data Marketing</option>
                    {#each data.marketing as marketing }
                        <option value="{marketing}">{marketing}</option>
                    {/each}
                </select>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputPekerjaan" class="label">
                    <span class="label-text">Pekerjaan</span>
                </label>
                <input type="text" bind:value={pekerjaan} placeholder="Masukkan Pekerjaan" class="input input-bordered w-full max-w-md" required/>
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputRekomendasi" class="label">
                    <span class="label-text">Rekomendasi Dari</span>
                </label>
                <input type="text" bind:value={rekomendasiDari} placeholder="Nama Perekomendasi" class="input input-bordered w-full max-w-md" />
            </div>

            <div class="form-control w-full max-w-md">
                <label for="inputKeterangan" class="label">
                    <span class="label-text">Keterangan</span>
                </label>
                <textarea bind:value={keterangan} class="textarea textarea-bordered h-24" placeholder="Keterangan" required></textarea>
            </div>

            <button type="submit" class="btn btn-success w-full">Update Data</button>

        </form>
    </form>
</div>

<!-- Delete?? -->
<div class="modal" class:modal-open={isDelete}>
    <form method="dialog" class="modal-box max-w-none w-1/2">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={ () => isDelete = false }>✕</button>

        <h2 class="card-title">Peringatan!</h2>
        <p>Member akan dihapus!</p>
        <div class="card-actions justify-end">
            <button on:click={doErase} class="btn btn-secondary">Ya, Hapus</button>
            <button on:click={ () => isDelete = false } class="btn btn-ghost">Batalkan</button>
        </div>

    </form>
</div>