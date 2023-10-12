<script lang="ts">
    import { baseConfiguration } from "$lib/baseConfig";
    import toast, { Toaster } from 'svelte-french-toast';

    import Header from "../features/Header.svelte";
    export let data;

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

    async function doPost(){
        const doPost = await fetch(baseConfiguration.defaultURL + 'Tambah-Member',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            credentials : 'include',
            body : JSON.stringify({
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
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
</script>
<Toaster />
<Header />
<div class="container mx-auto">

    <div class="card w-full bg-base-100 shadow-xl my-5">
        <div class="card-body">
            <h2 class="card-title">Penambahan Member Baru</h2>

            <form on:submit|preventDefault={doPost}>
                <div class="grid grid-cols-2 place-items-center gap-2 my-5">
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
                </div>
                <button type="submit" class="btn btn-accent w-full">Simpan Data Member</button>
            </form>
            
        </div>
    </div>

</div>