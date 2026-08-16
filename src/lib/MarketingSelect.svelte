<script lang="ts">
    /**
     * The single marketing dropdown for the whole app.
     *
     * The 15-item list used to be hardcoded in four files (five copies), so adding
     * a marketing value meant editing every one of them. It now lives only in
     * src/strings/marketing.ts and is rendered here.
     *
     * `includeSemua` adds the "show everything" option. Use it on FILTERS only.
     * Never enable it on a control that WRITES a record's marketing value — "SEMUA"
     * is a query keyword, not a real marketing, and saving it would corrupt the row.
     */
    import { createEventDispatcher } from 'svelte';
    import { marketing } from '../strings/marketing';

    export let value: string | undefined = undefined;
    export let includeSemua = false;
    export let semuaLabel = 'Tampilkan Semua Data';
    export let placeholder = 'Pilih Data Marketing';
    export let required = false;

    let klass = 'select select-info max-w-xs';
    export { klass as class };

    const dispatch = createEventDispatcher<{ change: string }>();

    // Assign `value` before dispatching so a parent using bind:value already sees the
    // new value by the time its on:change handler runs. The handler can also just read
    // event.detail, which is the same string.
    function handleChange(event: Event) {
        value = (event.currentTarget as HTMLSelectElement).value;
        dispatch('change', value);
    }
</script>

<select {value} on:change={handleChange} class={klass} {required}>
    <option selected disabled>{placeholder}</option>
    {#if includeSemua}
        <option value="SEMUA">{semuaLabel}</option>
    {/if}
    {#each marketing as item}
        <option value={item}>{item}</option>
    {/each}
</select>
