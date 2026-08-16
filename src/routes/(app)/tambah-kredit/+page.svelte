<script lang="ts">
    import PageHeader from "$lib/PageHeader.svelte";
    import Panel from "$lib/Panel.svelte";
    import { baseConfiguration } from "$lib/baseConfig";
    import { rupiahFormatter } from "$lib/formatter";
    import toast from '$lib/toast';

    import MemberSearch from "$lib/MemberSearch.svelte";

    export let data;
    let uniqueID:string = data.unique;

    // The nasabah is now picked via typeahead. This page used to receive all 2,736
    // members up front and render them as <option> elements.
    let selectedMember:any = null;
    let namaNasabah:string = '';

    let time:Date   = new Date();
    $: day          = time.getDay();
    $: month        = time.getMonth();
    $: year         = time.getFullYear();
    $: hours        = time.getHours();
    $: minutes      = time.getMinutes();
    $: seconds      = time.getSeconds();

    let jumlahPengajuan:number;
    let timePeriod:number       = 1;
    let currentAddress:string   = '-';
    let currentMarketing:string = '-';
    let jatuhTempo:Date;
    let biayaAdmin:number;
    let keterangan:string;

    $: bungaJasa = timePeriod * 5/100;
    $: totalAngsuran = (jumlahPengajuan + (jumlahPengajuan * bungaJasa)) / timePeriod;
    $: totalAmount = ( Number(totalAngsuran) * timePeriod ) - biayaAdmin;

    const startInterval = setInterval(() => {
        time = new Date();
    },1000)

    function onSelectMember(event:CustomEvent<any>):void {
        selectedMember   = event.detail;
        currentAddress   = selectedMember.ALAMAT || '-';
        currentMarketing = selectedMember.MARKETING || '-';
    }

    function onClearMember():void {
        selectedMember   = null;
        currentAddress   = '-';
        currentMarketing = '-';
    }

    async function doPost(){
        // Typing a name without picking from the list leaves no member ID, and the
        // backend looks the nasabah up by ID. Catch it here with a clear message
        // rather than letting it fail server-side.
        if(!selectedMember){
            return toast.error('Pilih nasabah dari daftar pencarian', { position : 'top-right' });
        }

        const doPost = await fetch(baseConfiguration.clientURL + 'Tambah-Kredit',{
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({
                JUMLAH_PENGAJUAN : jumlahPengajuan,
                ID : selectedMember.ID,
                NO_KREDIT : uniqueID,
                MARKETING : currentMarketing,
                JANGKA_WAKTU : timePeriod,
                ANGSURAN : totalAngsuran,
                JATUH_TEMPO : jatuhTempo,
                BIAYA_ADMIN : biayaAdmin,
                KETERANGAN : keterangan
            })
        });
        const doResponse = await doPost.json();
        return doResponse.status == 'success' ? toast.success(doResponse.message, { position: 'top-right' }) : toast.error(doResponse.message, { position : 'top-right' });
    }
</script>
<svelte:head><title>Tambah Kredit — Kosada</title></svelte:head>

<PageHeader title="Tambah Kredit" description="Buat pinjaman baru untuk nasabah" />

<div class="px-4 lg:px-8 py-5">
    <Panel>
            <form on:submit|preventDefault={doPost}>
                <div class="grid grid-cols-2 place-items-center gap-2 my-5">

                    <div class="form-control w-full max-w-lg">
                        <label for="inputJumlah" class="label">
                            <span class="label-text">Jumlah Pengajuan</span>
                        </label>
                        <input type="number" bind:value={jumlahPengajuan} placeholder="(Diisi sendiri)" class="input input-bordered w-full max-w-lg"/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputNasabah" class="label">
                            <span class="label-text">Nama Nasabah</span>
                        </label>
                        <MemberSearch
                            id="inputNasabah"
                            bind:value={namaNasabah}
                            placeholder="Ketik nama nasabah.."
                            required
                            on:select={onSelectMember}
                            on:clear={onClearMember} />
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputAlamat" class="label">
                            <span class="label-text">Alamat Nasabah</span>
                        </label>
                        <input type="text" placeholder="Alamat Nasabah" class="input input-bordered w-full max-w-lg" value="{currentAddress}" disabled/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputKredit" class="label">
                            <span class="label-text">No Kredit</span>
                        </label>
                        <input type="text" placeholder="No Kredit" value="{uniqueID}" class="input input-bordered w-full max-w-lg" disabled/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputMarketing" class="label">
                            <span class="label-text">Marketing / Kolektor</span>
                        </label>
                        <input type="text" placeholder="Data Marketing" class="input input-bordered w-full max-w-lg" value="{currentMarketing}" disabled/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputTanggalPengajuan" class="label">
                            <span class="label-text">Tanggal Pengajuan</span>
                        </label>
                        <input type="text" placeholder="Tanggal Pengajuan" class="input input-bordered w-full max-w-lg" value="{day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds }" disabled/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="selectKredit" class="label">
                            <span class="label-text">Jenis Kredit</span>
                        </label>
                        <select bind:value={timePeriod} class="select select-bordered w-full max-w-lg" required>
                            <option disabled selected>Pilih Jangka Waktu</option>
                            {#each Array(24) as loop,index }
                                <option value="{index + 1}">{index + 1} Bulan</option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputJangkaWaktu" class="label">
                            <span class="label-text">Jangka Waktu</span>
                        </label>
                        <input type="text" placeholder="(Mengisi Otomatis)" class="input input-bordered w-full max-w-lg" value="{timePeriod}" disabled/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputJumlahAngsuran" class="label">
                            <span class="label-text">Jumlah Angsuran</span>
                        </label>
                        <input type="text" placeholder="(Mengisi Otomatis)" class="input input-bordered w-full max-w-lg" value="{ Number.isNaN(totalAngsuran) ? '-' :  rupiahFormatter.format(totalAngsuran)}" disabled/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputJatuhTempo" class="label">
                            <span class="label-text">Jatuh Tempo</span>
                        </label>
                        <input type="date" bind:value={jatuhTempo} class="input input-bordered w-full max-w-lg" required/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputBiayaAdmin" class="label">
                            <span class="label-text">Biaya Admin</span>
                        </label>
                        <input type="number" bind:value={biayaAdmin} placeholder="Rp. 0,00-" class="input input-bordered w-full max-w-lg" required/>
                    </div>

                    <div class="form-control w-full max-w-lg">
                        <label for="inputKeterangan" class="label">
                            <span class="label-text">Keterangan</span>
                        </label>
                        <textarea bind:value={keterangan} class="textarea textarea-bordered h-24" placeholder="Misal: Tambah jaminan BPKB" required></textarea>
                    </div>                    

                    <div class="alert alert-info w-96">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Total yang dibayarkan : <span class="text-white">{ Number.isNaN(totalAmount) ? '-' : rupiahFormatter.format(totalAmount) }</span></span>
                    </div>
    
                    <button type="submit" class="btn btn-primary w-96 my-5">Simpan Data Kredit</button>
                </div>
                

            </form>
    </Panel>
</div>