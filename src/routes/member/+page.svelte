<script lang="ts">
    import Header from "../features/Header.svelte";
    export let data;
    let newData:any = data.data;
    let currentCategory:string  = 'SEMUA';
    let staticData:any          = newData;

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
</script>
<Header/>
<div class="container mx-auto">

    <div class="flex justify-between ...">
        <h2 class="card-title">Member Koperasi Kosada</h2>
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
                                        <button type="button" class="btn me-2">Edit</button>
                                        <button type="button" class="btn me-2">Hapus</button>
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