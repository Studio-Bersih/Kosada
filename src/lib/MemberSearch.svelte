<script lang="ts">
    /*
    | Typeahead picker for nasabah.
    |
    | Replaces the <select> that used to hold all 2,736 members (311 KB of JSON and
    | 2,736 DOM options) on Tambah Kredit. The server returns at most 20 matches and
    | nothing for an empty query, so the payload can never grow with the member list.
    |
    | Emits `select` with the chosen member: { ID, NAMA, ALAMAT, PEKERJAAN, MARKETING }.
    */
    import { createEventDispatcher } from 'svelte';
    import { baseConfiguration } from '$lib/baseConfig';

    export let value = '';
    export let placeholder = 'Ketik nama nasabah..';
    export let id = 'cariNasabah';
    export let required = false;

    let results:any = [];
    let isSearching = false;
    let searchTimer:ReturnType<typeof setTimeout>;

    const dispatch = createEventDispatcher<{ select : any, clear : void }>();

    function onInput(){
        // A member chosen earlier is no longer what's typed, so tell the parent to
        // drop it rather than letting a stale selection be submitted.
        dispatch('clear');
        clearTimeout(searchTimer);
        searchTimer = setTimeout(doSearch, 300);
    }

    async function doSearch(){
        if(!value.trim()){
            results = [];
            return;
        }
        isSearching = true;
        try {
            const doGet = await fetch(
                baseConfiguration.clientURL + 'Cari-Member?nama=' + encodeURIComponent(value),
                { method : 'GET' }
            );
            results = await doGet.json();
        } catch {
            results = [];
        }
        isSearching = false;
    }

    function pick(member:any){
        value   = member.NAMA;
        results = [];
        dispatch('select', member);
    }
</script>

<div class="form-control relative w-full">
    <input
        {id}
        type="search"
        bind:value
        on:input={onInput}
        {placeholder}
        {required}
        autocomplete="off"
        class="input input-bordered w-full"/>

    {#if isSearching}
        <span class="label-text-alt mt-1 opacity-60">Mencari..</span>
    {/if}

    {#if results.length > 0}
        <!-- Drops in rather than appearing, so it reads as attached to the input
             it came from. Deliberately the shortest duration in the app: this
             fires while the user is still typing. -->
        <ul class="menu bg-base-100 rounded-box shadow-lg absolute top-full left-0 right-0 z-30 max-h-60 flex-nowrap overflow-y-auto border border-base-300"
            style="animation: kosada-rise var(--dur-instant) var(--ease-out) both;">
            {#each results as member}
                <li>
                    <button type="button" on:click={() => pick(member)} class="flex flex-col items-start gap-0">
                        <span>{member.NAMA}</span>
                        {#if member.PEKERJAAN || member.ALAMAT}
                            <span class="text-xs opacity-60">
                                {[member.PEKERJAAN, member.ALAMAT].filter(Boolean).join(' · ')}
                            </span>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    {/if}
</div>
