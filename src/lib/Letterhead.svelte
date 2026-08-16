<script lang="ts">
    /*
    | Koperasi Kosada letterhead for printed sheets.
    |
    | The same block was inlined in the loan and surat-tugas print pages. It now
    | lives here so the new report / macet / transfer sheets all match, and the
    | address only has to be corrected in one place.
    */
    export let title = '';
    export let subtitle = '';
</script>

<div class="grid grid-cols-2 place-items-center gap-2">
    <img src="/logo.png" alt="Logo Koperasi Kosada" class="h-32" />
    <div>
        <h3 class="text-center font-bold text-xl">KOSADA</h3>
        <h5 class="text-center">~ SAHABAT KARYAWAN ~</h5>
        <h5 class="text-center">BH. NO. 135/BH/KWK.13/X/1997</h5>
        <h6 class="text-center text-sm">Jl. Kyai Parseh Jaya Bumiayu Malang Telp (0341) 751822 / WA . (0812 3339 6455)</h6>
    </div>
</div>

<div class="divider my-3"></div>

{#if title}
    <h2 class="text-center text-lg font-bold">{title}</h2>
{/if}
{#if subtitle}
    <p class="text-center text-sm opacity-80 mb-4">{subtitle}</p>
{/if}
