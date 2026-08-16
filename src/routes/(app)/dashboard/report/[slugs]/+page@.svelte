<script lang="ts">
    import { rupiahFormatter } from '$lib/formatter.js';
    export let data;
    let newData:any = data.data;
</script>
<div class="container mx-auto">
    <div class="card w-full bg-base-100 shadow-xl">
        <div class="card-body">

            <div class="flex justify-end">
                <button type="button" on:click={() => window.print()} class="btn btn-primary w-48 my-2 ms-2 no-print">Cetak Halaman Ini</button>
            </div>
            
            <div class="grid grid-cols-2 place-items-center gap-2">
                <img src="/logo.png" alt="Logo Koperasi Kosada" class="h-48" />
                <div>
                    <h3 class="text-center">KOSADA</h3>
                    <h5 class="text-center">~ SAHABAT KARYAWAN ~</h5>
                    <h5 class="text-center">BH. NO. 135/BH/KWK.13/X/1997</h5>
                    <h6 class="text-center">Jl. Kyai Parseh Jaya Bumiayu Malang Telp (0341) 751822 / WA . (0812 3339 6455)</h6>
                </div>
            </div>

            <div class="divider my-5"></div>

            <div class="grid grid-cols-2 place-items-center gap-2">
                <div class="form-control w-full max-w-md">
                    <label for="inputName" class="label">
                        <span class="label-text">Nama Nasabah</span>
                    </label>
                    <input type="text" value="{newData.NAMA}" placeholder="Masukkan Nama" class="input input-bordered w-full max-w-md" disabled/>
                </div>
    
                <div class="form-control w-full max-w-md">
                    <label for="inputAlamat" class="label">
                        <span class="label-text">Alamat Nasabah</span>
                    </label>
                    <input type="text" value="{newData.ALAMAT}" placeholder="Masukkan Alamat" class="input input-bordered w-full max-w-md" disabled/>
                </div>
            </div>
    
            <div class="overflow-auto">
                <table class="table">
                    <thead class="font-bold">
                        <tr>
                            <th>#</th>
                            <th>Nominal</th>
                            <th>Jatuh Tempo</th>
                            <th>Kasbon</th>
                            <th>Status Lunas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.DETAIL === undefined}
                            <tr>
                                <td>No newData</td>
                            </tr>
                        {:else}
                            {#each newData.DETAIL as detail, index }
                                <tr class="hover">
                                    <td>
                                        {#if detail.LUNAS == 'Belum'}
                                            <button type="button" class="btn btn-ghost w-full">Cicilan ke - {index + 1}</button>
                                        {:else}
                                            <button type='button' class='btn btn-primary w-full'>Lunas ✔</button>
                                        {/if}
                                    </td>
                                    <td>{rupiahFormatter.format(detail.NOMINAL)}</td>
                                    <td>{detail.JATUH_TEMPO}</td>
                                    <td>{ rupiahFormatter.format(Number(detail.KASBON)) }</td>
                                    <td>{detail.LUNAS} Lunas</td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

            <div class="form-control">
                <label for="keteranganPinjaman" class="label">
                    <span class="label-text">Keterangan</span>
                </label>
                <textarea class="textarea textarea-bordered h-24" placeholder="Keterangan" readonly>{newData.KETERANGAN}</textarea>
            </div>

            <div class="grid grid-cols-2 place-items-center gap-2 my-10">
                <h1>Kreditur</h1>
                <h1>Koperasi</h1>
            </div>
            <div class="grid grid-cols-2 place-items-center gap-2 my-10">
                <h1>{newData.NAMA}</h1>
                <h1>Koperasi Kosada</h1>
            </div>

        </div>
    </div>
</div>