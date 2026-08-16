<script lang="ts">
    /*
    | Drop-in replacement for svelte-french-toast's <Toaster/>.
    |
    | Pages import this rather than svelte-sonner directly, so placement and
    | styling are configured once here instead of in ten files, and swapping the
    | library again stays a two-file change.
    |
    | richColors gives success and error their own tints rather than a uniform
    | neutral toast — worth it when the message is "Data berhasil dihapus!".
    */
    import { Toaster as SonnerToaster } from 'svelte-sonner';
</script>

<SonnerToaster
    position="top-right"
    richColors
    closeButton
    duration={4000} />
