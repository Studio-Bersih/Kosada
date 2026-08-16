<script lang="ts">
    /*
    | What a table shows when it has no rows.
    |
    | Every empty table in this app used to read "Tidak ada data." — which left
    | staff unable to tell three different situations apart:
    |
    |   nothing has been recorded yet        -> add something
    |   the filter matched nothing           -> widen the filter
    |   the request failed                   -> try again
    |
    | `filtered` picks the right message; pass an action when there is an obvious
    | next step.
    */
    import Icon from '$lib/Icon.svelte';

    /** Columns to span, so the message centres under the whole table. */
    export let colspan:number = 6;
    /** True when filters are active — changes the wording and the suggestion. */
    export let filtered:boolean = false;
    /** What is missing, e.g. "data pinjaman". Used in the default message. */
    export let subject:string = 'data';
    /** Optional override for the headline. */
    export let title:string = '';
    /** Optional override for the explanation. */
    export let hint:string = '';
    export let icon:string = 'empty';
</script>

<tr>
    <td {colspan} class="py-12">
        <div class="flex flex-col items-center text-center gap-2">
            <div class="text-muted opacity-50">
                <Icon name={icon} size={40} />
            </div>

            <p class="font-medium">
                {title || (filtered ? 'Tidak ada hasil yang cocok' : `Belum ada ${subject}`)}
            </p>

            <p class="text-sm text-muted max-w-sm">
                {hint || (filtered
                    ? 'Coba ubah kata kunci, ganti data marketing, atau perlebar rentang tanggalnya.'
                    : `Data akan muncul di sini setelah ${subject} ditambahkan.`)}
            </p>

            <slot />
        </div>
    </td>
</tr>
