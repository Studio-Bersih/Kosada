<script lang="ts">
    /*
    | The confirmation an administrator-only action opens.
    |
    | Collects the acting administrator's own password and hands it back, because
    | the server re-verifies it on every restricted action — see
    | Kosada\Concerns\RequiresAdmin. Kosada has no session, so this is not an
    | extra hoop on top of a check: it IS the check.
    |
    | Doubles as the "are you sure" that destructive actions need anyway. Transfer
    | Harian's delete previously had no confirmation at all — one misclick removed
    | a row.
    |
    | Used by Manajemen Akun, Transfer Harian and Data Macet.
    */
    import { createEventDispatcher } from 'svelte';

    export let open = false;
    /** One line describing exactly what is about to happen. */
    export let action = '';
    /** The signed-in administrator's email, shown so they know which password. */
    export let email = '';
    export let busy = false;
    export let confirmLabel = 'Lanjutkan';

    let password = '';

    const dispatch = createEventDispatcher<{ confirm : string; cancel : void }>();

    function cancel(){
        password = '';
        open = false;
        dispatch('cancel');
    }

    function submit(){
        if(!password) return;
        dispatch('confirm', password);
    }

    /* Clear the password whenever the dialog closes, however it closed. */
    $: if(!open) password = '';
</script>

<div class="modal" class:modal-open={open}>
    <div class="modal-box">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                aria-label="Tutup" on:click={cancel}>✕</button>

        <h2 class="font-semibold">Konfirmasi Administrator</h2>
        {#if action}
            <p class="py-2 text-sm">{action}</p>
        {/if}

        <div class="form-control mt-2">
            <label for="adminConfirmPassword" class="label">
                <span class="label-text">Password Anda{email ? ` (${email})` : ''}</span>
            </label>
            <input
                id="adminConfirmPassword"
                type="password"
                bind:value={password}
                class="input input-bordered"
                placeholder="Masukkan password Anda"
                autocomplete="current-password"
                on:keydown={(e) => e.key === 'Enter' && submit()} />
            <span class="label-text-alt mt-1">
                Server memverifikasi password ini dan memastikan akun Anda Administrator.
            </span>
        </div>

        <div class="card-actions justify-end mt-4">
            <button type="button" class="btn btn-ghost btn-sm" on:click={cancel}>Batalkan</button>
            <button type="button" class="btn btn-primary btn-sm" on:click={submit} disabled={busy || !password}>
                {#if busy}
                    <span class="loading loading-spinner loading-xs"></span> Memproses..
                {:else}
                    {confirmLabel}
                {/if}
            </button>
        </div>
    </div>
</div>
