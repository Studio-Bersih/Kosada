<script lang="ts">
    import { baseConfiguration } from "$lib/baseConfig";
    import Header from "../features/Header.svelte";

    let newData:any = [];

    let tanggalAwal:Date;
    let tanggalAkhir:Date;
    let dataMarketing:string;

    async function doPost(){
        const doPost = await fetch(baseConfiguration.defaultURL + 'Report',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            // credentials : 'include',
            body : JSON.stringify({
                TANGGAL_AWAL    : tanggalAwal,
                TANGGAL_AKHIR   : tanggalAkhir,
                MARKETING       : dataMarketing
            })
        });
        const doResponse = await doPost.json();
        console.log(doResponse);
    }
</script>
<Header />
<div class="container mx-auto">
    <div class="card w-full bg-base-100 shadow-xl my-10">
        <div class="card-body">
            <h2 class="card-title">Report!</h2>

                <form class="grid gap-2 grid-cols-4" on:submit|preventDefault={doPost}>
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
                        <select bind:value={dataMarketing} class="select select-info max-w-xs" required>
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
                    <button type="submit" class="btn btn-accent mt-8">Lihat Laporan</button>
                </form>

                <div class="overflow-x-auto mt-10">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nama</th>
                                <th>Kasbon</th>
                                <th>Pinjaman</th>
                                <th>Progress Cicilan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

        </div>
    </div>
</div>