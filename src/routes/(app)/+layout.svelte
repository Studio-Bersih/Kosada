<script lang="ts">
    /*
    | The app shell.
    |
    | Defined once here rather than imported by each of the nine pages, which is
    | what the old <Header/> arrangement required. Print routes escape this layout
    | by naming their page +page@.svelte, so a printed sheet never carries the
    | sidebar or the toaster.
    |
    | The (app) group affects file layout only — every URL is unchanged.
    */
    import { page } from '$app/stores';
    import Sidebar from '$lib/Sidebar.svelte';
    import Toaster from '$lib/Toaster.svelte';
</script>

<Toaster />

<div class="flex min-h-screen bg-base-200">
    <Sidebar />

    <!--
      | min-w-0 matters: without it a wide table forces the whole flex row to grow
      | instead of scrolling inside its own container.
      |
      | pt-14 below lg clears the floating menu button, which is fixed at top-left
      | and otherwise sits on top of the page heading.
    -->
    <main class="flex-1 min-w-0 pt-14 lg:pt-0 px-3 lg:px-0">
        <!--
          | Keyed on the pathname so the entrance animation replays on every
          | navigation. This is what browsers without the View Transitions API
          | get; where the API is supported the two simply layer.
        -->
        {#key $page.url.pathname}
            <div class="page-enter">
                <slot />
            </div>
        {/key}
    </main>
</div>
