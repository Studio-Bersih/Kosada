<script lang="ts">
    import { baseConfiguration } from "$lib/baseConfig";
    import toast, { Toaster } from 'svelte-french-toast';
    import Header from "../features/Header.svelte";
    export let data;
    let newData:any = data.data;
    let isModal:boolean = false;

    let nomorSurat:string;
    let lampiranSurat:string;
    let perihalSurat:string;
    let isiSurat:string;

    async function doPost(){
        const doPost = await fetch(baseConfiguration.defaultURL + 'Surat-Tugas',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            credentials : 'include',
            body : JSON.stringify({
                NOMOR_SURAT : nomorSurat,
                LAMP        : lampiranSurat,
                HAL         : perihalSurat,
                KONTEN      : isiSurat
            })
        });
        const doResponse = await doPost.json();
        newData = [...newData,{
            NO_SURAT        : nomorSurat,
            TANGGAL_SURAT   : 'Muat ulang halaman',
            LAMPIRAN        : lampiranSurat,
            PERIHAL         : perihalSurat
        }];
        newData = newData;
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
</script>
<Toaster />
<Header />
<div class="container mx-auto">
    <div class="card w-full bg-base-100 shadow-xl my-10">
        <div class="card-body">
            <h1 class="card-title">Surat Tugas!</h1>
            <div class="flex justify-end">
                <button type="button" on:click={() => isModal = true} class="btn btn-primary w-48 my-2 ms-2">Buat Surat Tugas</button>
            </div>

            <div class="overflow-x-auto">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>No Surat</th>
                            <th>Tanggal Surat</th>
                            <th>Lampiran</th>
                            <th>Perihal</th>
                            <th>Lihat Surat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each newData as data,index }
                            <tr>
                                <td>{index + 1}</td>
                                <td>{ data.NO_SURAT }</td>
                                <td>{ data.TANGGAL_SURAT }</td>
                                <td>{ data.LAMPIRAN }</td>
                                <td>{ data.PERIHAL }</td>
                                <td>
                                    <a href="/surat-tugas/report/{data.ID}" class="btn btn-info">Lihat</a>
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
    <form on:submit={doPost} method="dialog" class="modal-box max-w-none w-1/2">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" on:click={ () => isModal = false }>✕</button>

        <div class="form-control w-full my-3">
            <label for="nomorSurat" class="label">
                <span class="label-text">Nomor Surat</span>
            </label>
            <input type="text" bind:value={nomorSurat} placeholder="Cth: KOSADA/2022/10/16-20:21" class="input input-bordered w-full" />
        </div>
        
        <div class="form-control w-full my-3">
            <label for="lampiran" class="label">
                <span class="label-text">Lampiran</span>
            </label>
            <input type="text" bind:value={lampiranSurat} placeholder="Cth: Bukti Pembayaran (2 Lembar)" class="input input-bordered w-full" />
        </div>

        <div class="form-control w-full my-3">
            <label for="hal" class="label">
                <span class="label-text">Perihal</span>
            </label>
            <input type="text" bind:value={perihalSurat} placeholder="Cth: Penagihan Pembayaran" class="input input-bordered w-full" />
        </div>

        <div class="form-control w-full my-3">
            <label for="isiSurat" class="label">
                <span class="label-text">Isi Surat</span>
            </label>
            <textarea bind:value={isiSurat} class="textarea textarea-bordered" placeholder="Isi Surat" rows="5"></textarea>
        </div>

        <div class="flex justify-end my-5">
            <button type="submit" class="btn btn-success">Simpan Data</button>
        </div>

    </form>
</div>