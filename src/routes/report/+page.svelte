<script lang="ts">
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from "$lib/baseConfig";
    import { rupiahFormatter } from "$lib/formatter";
    import Header from "../features/Header.svelte";
    import MarketingSelect from "$lib/MarketingSelect.svelte";

    let newData:any = [];

    let tanggalAwal:Date;
    let tanggalAkhir:Date;
    let dataMarketing:string = 'SEMUA';
    let namaNasabah:string   = '';

    const getReport = async () => {
        const doPost = await fetch(baseConfiguration.clientURL + 'Report',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                TANGGAL_AWAL    : tanggalAwal,
                TANGGAL_AKHIR   : tanggalAkhir,
                MARKETING       : dataMarketing,
                NAMA            : namaNasabah
            })
        });
        const doResponse = await doPost.json();
        newData = doResponse;
        return newData;
    };
    
    async function doPost(){
        return toast.promise(getReport(),{
            loading : 'Memuat data..',
            success : 'Data berhasil dimuat!',
            error   : 'Ada masalah pada server'
        }, { position : 'top-right' });
    }
</script>
<Toaster />
<Header />
<div class="container mx-auto">
    <div class="card w-full bg-base-100 shadow-xl my-10">
        <div class="card-body">
            <h2 class="card-title">Report!</h2>

            <form class="grid gap-2 grid-cols-5" on:submit|preventDefault={doPost}>
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
                    <input type="date" bind:value={tanggalAwal} placeholder="Type here" class="input input-bordered w-full max-w-xs" required/>
                </div>
                <div class="form-control w-full max-w-xs">
                    <label for="startDate" class="label">
                        <span class="label-text">Tanggal Awal</span>
                    </label>
                    <input type="date" bind:value={tanggalAkhir} placeholder="Type here" class="input input-bordered w-full max-w-xs" required/>
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

            <div class="overflow-x-auto mt-10">
                <table class="table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama</th>
                            <th>Kasbon</th>
                            <th>Angsuran</th>
                            <th>Progress Cicilan</th>
                            <th>Tanggal Pinjaman</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each newData as data,index }
                            <tr class="hover">
                                <td>{ index + 1 }</td>
                                <td>{ data.NAMA }</td>
                                <td>{ rupiahFormatter.format(data.KASBON) }</td>
                                <td>{ rupiahFormatter.format(data.CICILAN_TOTAL) }</td>
                                <td>{ data.PROGRESS }</td>
                                <td>{ data.CREATED_AT }</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>