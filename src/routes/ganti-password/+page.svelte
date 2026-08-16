<script lang="ts">
    import { onMount } from 'svelte';
    import toast, { Toaster } from 'svelte-french-toast';
    import { baseConfiguration } from '$lib/baseConfig';
    import { getAccount } from '$lib/session';
    import Header from '../features/Header.svelte';

    let email:string          = '';
    let namaAkun:string       = '';
    let passwordLama:string   = '';
    let passwordBaru:string   = '';
    let konfirmasi:string     = '';
    let isSaving:boolean      = false;

    onMount(() => {
        const account = getAccount();
        if(account){
            email    = account.email;
            namaAkun = account.name;
        }
    });

    $: cocok        = passwordBaru.length > 0 && passwordBaru === konfirmasi;
    $: cukupPanjang = passwordBaru.length >= 8;
    $: bisaSimpan   = email.length > 0
                   && passwordLama.length > 0
                   && cukupPanjang
                   && cocok
                   && passwordBaru !== passwordLama
                   && !isSaving;

    async function doSubmit(){
        // Caught here so the user isn't billed a round-trip for a typo.
        if(!cukupPanjang) return toast.error('Password baru minimal 8 karakter', { position : 'top-right' });
        if(!cocok)        return toast.error('Konfirmasi password tidak cocok', { position : 'top-right' });
        if(passwordBaru === passwordLama) return toast.error('Password baru tidak boleh sama dengan password lama', { position : 'top-right' });

        isSaving = true;
        try {
            const doPost = await fetch(baseConfiguration.clientURL + 'Ganti-Password',{
                method  : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body    : JSON.stringify({
                    email         : email,
                    PASSWORD_LAMA : passwordLama,
                    PASSWORD_BARU : passwordBaru
                })
            });
            const doResponse = await doPost.json();

            if(doResponse.status == 'success'){
                toast.success(doResponse.message, { position : 'top-right' });
                passwordLama = '';
                passwordBaru = '';
                konfirmasi   = '';
            } else {
                toast.error(doResponse.message ?? 'Gagal mengubah password', { position : 'top-right' });
            }
        } catch {
            toast.error('Ada masalah pada server', { position : 'top-right' });
        }
        isSaving = false;
    }
</script>
<Toaster />
<Header />
<div class="container mx-auto">
    <div class="card w-full max-w-2xl mx-auto bg-base-100 shadow-xl my-10">
        <div class="card-body">
            <h2 class="card-title">Ganti Password</h2>

            <div class="alert alert-warning mt-2">
                <span>
                    <strong>Perhatian:</strong> akun Kosada digunakan bersama oleh seluruh staf.
                    Mengubah password di sini berarti mengubahnya untuk semua orang, dan
                    semua staf harus memakai password yang baru saat login berikutnya.
                </span>
            </div>

            <form on:submit|preventDefault={doSubmit} class="mt-4 space-y-4">
                <div class="form-control">
                    <label for="emailAkun" class="label">
                        <span class="label-text">Email Akun</span>
                    </label>
                    <input id="emailAkun" type="email" bind:value={email} placeholder="admin@kosada.id" class="input input-bordered" required/>
                    {#if namaAkun}
                        <span class="label-text-alt mt-1 opacity-70">Masuk sebagai: {namaAkun}</span>
                    {/if}
                </div>

                <div class="form-control">
                    <label for="passwordLama" class="label">
                        <span class="label-text">Password Lama</span>
                    </label>
                    <input id="passwordLama" type="password" bind:value={passwordLama} placeholder="Masukkan password saat ini" class="input input-bordered" required/>
                </div>

                <div class="form-control">
                    <label for="passwordBaru" class="label">
                        <span class="label-text">Password Baru</span>
                    </label>
                    <input id="passwordBaru" type="password" bind:value={passwordBaru} placeholder="Minimal 8 karakter" class="input input-bordered" required/>
                    {#if passwordBaru.length > 0 && !cukupPanjang}
                        <span class="label-text-alt mt-1 text-error">Minimal 8 karakter</span>
                    {/if}
                </div>

                <div class="form-control">
                    <label for="konfirmasi" class="label">
                        <span class="label-text">Konfirmasi Password Baru</span>
                    </label>
                    <input id="konfirmasi" type="password" bind:value={konfirmasi} placeholder="Ulangi password baru" class="input input-bordered" required/>
                    {#if konfirmasi.length > 0 && !cocok}
                        <span class="label-text-alt mt-1 text-error">Konfirmasi tidak cocok</span>
                    {/if}
                </div>

                <button type="submit" class="btn btn-primary w-full" disabled={!bisaSimpan}>
                    {#if isSaving}
                        <span class="loading loading-spinner loading-sm"></span> Menyimpan..
                    {:else}
                        Simpan Password Baru
                    {/if}
                </button>
            </form>
        </div>
    </div>
</div>
