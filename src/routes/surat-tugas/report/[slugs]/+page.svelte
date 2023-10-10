<script lang="ts">
    export let data;
    let newData:any = data.data;
</script>

<div class="container mx-auto">
    <div class="grid grid-cols-2 place-items-center gap-2 my-5">
        <img src="/logo.png" alt="Logo Koperasi Kosada" class="h-48" />
        <div>
            <h3 class="text-center">KOSADA</h3>
            <h5 class="text-center">~ SAHABAT KARYAWAN ~</h5>
            <h5 class="text-center">BH. NO. 135/BH/KWK.13/X/1997</h5>
            <h6 class="text-center">Jl. Kyai Parseh Jaya Bumiayu Malang Telp (0341) 751822 / WA . (0812 3339 6455)</h6>
        </div>
    </div>

    <div class="divider"></div>

    <div class="form-control w-full my-3">
        <label for="nomorSurat" class="label">
            <span class="label-text">Nomor Surat</span>
        </label>
        <input type="text" value="{newData.NO}" placeholder="Masukkan Nama" class="input input-ghost w-full"/>
    </div>

    <div class="form-control w-full my-3">
        <label for="lampiranSurat" class="label">
            <span class="label-text">Lampiran Surat</span>
        </label>
        <input type="text" value="{newData.LAMPIRAN}" placeholder="Masukkan Nama" class="input input-ghost w-full"/>
    </div>

    <div class="form-control w-full my-3">
        <label for="perihalSurat" class="label">
            <span class="label-text">Perihal</span>
        </label>
        <input type="text" value="{newData.HAL}" placeholder="Masukkan Nama" class="input input-ghost w-full"/>
    </div>

    <div class="form-control w-full my-3">
        <label for="isiSurat" class="label">
            <span class="label-text">Isi</span>
        </label>
        <textarea class="textarea textarea-ghost" value={newData.TEKS} placeholder="Isi Surat" rows="15"></textarea>
    </div>

    <div class="flex justify-end">
        <a href="/surat-tugas" class="btn btn-accent w-48 my-2 ms-2 no-print">Kembali</a>
        <button type="button" on:click={() => window.print()} class="btn btn-neutral w-48 my-2 ms-2 no-print">Cetak Halaman Ini</button>
    </div>

    <div class="flex justify-end my-5">
        <p class="mb-10">Malang, 2 Oktober 2023</p>
    </div>
    <div class="flex justify-end my-5">
        <p class="mt-10">Koperasi Kosada</p>
    </div>


</div>
