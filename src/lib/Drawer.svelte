<script lang="ts">
    /*
    | A right-side slide-over.
    |
    | Replaces the centred modal for the loan detail, which was the worst-fitting
    | surface in the app: a half-width box trying to hold a nine-column installment
    | table, so the table was cramped and the box still overflowed on smaller
    | screens. A slide-over is full-height, can be as wide as the content needs,
    | and keeps the list visible behind it so you do not lose your place.
    |
    | Confirmation dialogs stay as centred modals — those SHOULD interrupt.
    */
    import Icon from '$lib/Icon.svelte';

    export let open:boolean = false;
    export let title:string = '';
    export let subtitle:string = '';
    /** Tailwind max-width for the panel. */
    export let width:string = 'max-w-3xl';

    function close(){ open = false; }

    function onKeydown(event:KeyboardEvent){
        if(event.key === 'Escape') close();
    }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
    <!-- Scrim. A button so Escape isn't the only way out and screen readers get
         a real control rather than a clickable div. Fades rather than appearing,
         so the panel looks like it is carrying the backdrop in with it. -->
    <button
        type="button"
        class="fixed inset-0 bg-black/40 z-40 no-print"
        style="animation: kosada-fade var(--dur-fast) var(--ease-out) both;"
        aria-label="Tutup panel"
        on:click={close}></button>
{/if}

<!--
  | Slides on transform only, so the whole panel is composited and the
  | installment table inside it does not re-layout on a single frame.
-->
<aside
    class="fixed inset-y-0 right-0 z-50 w-full {width} bg-base-100 border-l border-base-300
           shadow-2xl flex flex-col no-print
           {open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}"
    style="transition: transform var(--dur-slow) var(--ease-out);
           will-change: {open ? 'transform' : 'auto'};"
    aria-hidden={!open}>

    <div class="flex items-start justify-between gap-4 px-5 py-4 border-b border-base-300 shrink-0">
        <div class="min-w-0">
            <h2 class="font-semibold truncate">{title}</h2>
            {#if subtitle}<p class="text-sm text-muted truncate">{subtitle}</p>{/if}
        </div>
        <button type="button" class="btn btn-ghost btn-sm btn-square" aria-label="Tutup" on:click={close}>
            <Icon name="expand" size={18} />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto px-5 py-4">
        <slot />
    </div>

    {#if $$slots.footer}
        <div class="border-t border-base-300 px-5 py-3 shrink-0 flex items-center justify-end gap-2">
            <slot name="footer" />
        </div>
    {/if}
</aside>
