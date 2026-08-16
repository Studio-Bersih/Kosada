<script lang="ts">
    /*
    | The band at the top of every page.
    |
    | Before this, each page opened straight into a card and put its title
    | wherever happened to be convenient — inside the card on some pages, floating
    | above it on others. That inconsistency is most of why the app felt unfinished
    | even after the theme changed.
    |
    | Sticky, because these pages scroll long tables and the title plus the primary
    | action should not scroll away with them.
    */
    export let title:string;
    /** One line of context under the title. Keep it factual. */
    export let description:string = '';
</script>

<header class="sticky top-0 z-30 bg-base-200/85 backdrop-blur border-b border-base-300">
    <div class="px-4 lg:px-8 py-4 flex items-start justify-between gap-4 flex-wrap">
        <div class="min-w-0">
            <h1 class="text-xl font-bold tracking-tight truncate">{title}</h1>
            {#if description || $$slots.meta}
                <div class="mt-0.5 text-sm text-muted flex items-center gap-2 flex-wrap">
                    {#if description}<span>{description}</span>{/if}
                    <slot name="meta" />
                </div>
            {/if}
        </div>

        <div class="flex items-center gap-2 shrink-0">
            <slot name="actions" />
        </div>
    </div>

    <slot name="toolbar" />
</header>
