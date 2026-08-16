<script lang="ts">
    /*
    | Login.
    |
    | Lives outside the (app) route group, so it has no sidebar and renders its
    | own Toaster.
    |
    | The previous version was a green gradient over an 911 KB photograph, which
    | clashed with the earthy palette used everywhere else and was the heaviest
    | asset in the app. A centred card on warm sand reads as a serious internal
    | tool and drops the photo entirely.
    */
    import { onMount } from 'svelte';
    import toast from '$lib/toast';
    import Toaster from '$lib/Toaster.svelte';
    import { baseConfiguration } from '$lib/baseConfig';
    import { goto } from '$app/navigation';
    import { saveAccount } from '$lib/session';
    import { theme } from '$lib/theme';

    let email:string;
    let password:string;
    let isLoading = false;

    onMount(() => theme.init());

    async function doPost(){
        isLoading = true;
        try {
            const URL:string = baseConfiguration.clientURL;
            const doPost = await fetch(URL.replace('Kosada/','UD84/') + 'Auth',{
                method : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body : JSON.stringify({ email : email, password : password })
            });
            const doResponse = await doPost.json();

            if(doResponse.status == 'Authenticated'){
                // Remembered only so Ganti Password knows whose password to change.
                // This is not a session — see $lib/session.ts.
                saveAccount({
                    email     : doResponse.email ?? email,
                    name      : doResponse.name ?? '',
                    privilege : doResponse.privilege ?? ''
                });
                return goto('/dashboard');
            }

            toast.error(doResponse.message ?? 'Email atau password salah');
        } catch {
            toast.error('Ada masalah pada server');
        }
        isLoading = false;
    }
</script>

<svelte:head><title>Masuk — Koperasi Kosada</title></svelte:head>

<Toaster />

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">

        <div class="text-center mb-8">
            <img src="/logo.png" alt="Logo Koperasi Kosada" class="h-20 mx-auto mb-4" />
            <h1 class="text-2xl font-bold tracking-tight">KOSADA</h1>
            <p class="text-sm text-muted">Sistem Internal Kosada</p>
        </div>

        <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body gap-4">
                <div>
                    <h2 class="text-lg font-semibold">Masuk</h2>
                    <p class="text-sm text-muted">Silakan masuk ke akun Anda.</p>
                </div>

                <form on:submit|preventDefault={doPost} class="space-y-4">
                    <div class="form-control">
                        <label for="inputEmail" class="label">
                            <span class="label-text">Email</span>
                        </label>
                        <input
                            id="inputEmail"
                            type="email"
                            bind:value={email}
                            placeholder="nama@kosada.id"
                            autocomplete="username"
                            class="input input-bordered w-full"
                            required/>
                    </div>

                    <div class="form-control">
                        <label for="inputPassword" class="label">
                            <span class="label-text">Password</span>
                        </label>
                        <input
                            id="inputPassword"
                            type="password"
                            bind:value={password}
                            placeholder="Masukkan password"
                            autocomplete="current-password"
                            class="input input-bordered w-full"
                            required/>
                    </div>

                    <button type="submit" class="btn btn-primary w-full" disabled={isLoading}>
                        {#if isLoading}
                            <span class="loading loading-spinner loading-sm"></span> Memproses..
                        {:else}
                            Masuk
                        {/if}
                    </button>
                </form>
            </div>
        </div>

        <p class="text-center text-xs text-muted mt-6">
            Copyright Kosada © {new Date().getFullYear()}<br/>
            <a href="https://wa.me/628984170335" target="_blank" rel="noreferrer" class="link link-hover">
                Created with 💖 by Odi
            </a>
        </p>
    </div>
</div>
