<script lang="ts">
    import '../app.css';
    import { onNavigate } from '$app/navigation';

    /*
    | Cross-page transitions via the View Transitions API.
    |
    | SvelteKit hands us the navigation; we hold it inside startViewTransition so
    | the browser can snapshot the old page, swap in the new one, and animate
    | between them. The actual animation is defined in app.css.
    |
    | Browsers without the API return early and navigate normally — this is a
    | progressive enhancement, not a dependency. Firefox and older Safari simply
    | get the .page-enter animation instead, which is why that exists separately
    | rather than relying on this alone.
    */
    onNavigate((navigation) => {
        if(typeof document === 'undefined') return;
        if(!(document as any).startViewTransition) return;

        return new Promise((resolve) => {
            (document as any).startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });
</script>

<svelte:head>
    <title>Kosada — Sistem Internal</title>
    <meta name="description" content="SIK — Sistem Internal Kosada" >
</svelte:head>

<slot/>
