<script lang="ts">
    /*
    | Account management. Administrator only.
    |
    | The Administrator check here decides what is SHOWN, nothing more. Every
    | mutating request re-sends the administrator's own email and password and the
    | server verifies both the credential and the role — see Kosada\Akun. That is
    | deliberate: Kosada has no session, so a frontend check protects nothing on
    | its own.
    */
    import { onMount } from 'svelte';
    import toast from '$lib/toast';
    import { baseConfiguration } from '$lib/baseConfig';
    import { getAccount, isAdmin, type KosadaAccount } from '$lib/session';
    import { readJsonArray } from '$lib/apiList';
    import PageHeader from '$lib/PageHeader.svelte';
    import Panel from '$lib/Panel.svelte';
    import Drawer from '$lib/Drawer.svelte';
    import EmptyState from '$lib/EmptyState.svelte';
    import SkeletonRows from '$lib/SkeletonRows.svelte';
    import Icon from '$lib/Icon.svelte';

    let account:KosadaAccount | null = null;
    let admin = false;
    let rows:any = [];
    let isLoading = true;

    // Edit / create drawer
    let isForm = false;
    let editing:any = null;
    let form = { NAMA : '', EMAIL : '', ROLE : 'Staff', PASSWORD : '' };

    // The administrator confirmation every mutation requires.
    let isConfirm = false;
    let confirmPassword = '';
    let isSaving = false;
    /** What the confirmation will run once the password is supplied. */
    let pendingAction:null | (() => Promise<void>) = null;
    let pendingLabel = '';

    onMount(async () => {
        account = getAccount();
        admin   = isAdmin(account);
        await load();
    });

    async function load(){
        isLoading = true;
        try {
            const doGet = await fetch(baseConfiguration.clientURL + 'Akun', { method : 'GET' });
            rows = await readJsonArray(doGet, 'Akun');
        } catch {
            toast.error('Ada masalah pada server');
        }
        isLoading = false;
    }

    function openCreate(){
        editing = null;
        form = { NAMA : '', EMAIL : '', ROLE : 'Staff', PASSWORD : '' };
        isForm = true;
    }

    function openEdit(row:any){
        editing = row;
        // Password blank means "leave it alone" — see Akun@updateAkun.
        form = { NAMA : row.NAMA, EMAIL : row.EMAIL, ROLE : row.ROLE, PASSWORD : '' };
        isForm = true;
    }

    /*
    | Every mutation funnels through here: describe it, collect the admin
    | password, then run it. Keeps the confirmation in exactly one place instead
    | of four near-identical dialogs.
    */
    function confirmThen(label:string, action:() => Promise<void>){
        pendingLabel   = label;
        pendingAction  = action;
        confirmPassword = '';
        isConfirm      = true;
    }

    async function runPending(){
        if(!pendingAction) return;
        if(!confirmPassword){
            return toast.error('Password administrator wajib diisi');
        }
        isSaving = true;
        try {
            await pendingAction();
        } finally {
            isSaving = false;
        }
    }

    /** Shared POST wrapper: injects the admin credential and reports the result. */
    async function post(path:string, body:Record<string,unknown>):Promise<boolean> {
        const doPost = await fetch(baseConfiguration.clientURL + path, {
            method  : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body    : JSON.stringify({
                ...body,
                ADMIN_EMAIL    : account?.email ?? '',
                ADMIN_PASSWORD : confirmPassword
            })
        });
        const doResponse = await doPost.json();

        if(doResponse.status === 'success'){
            toast.success(doResponse.message);
            isConfirm = false;
            isForm    = false;
            await load();
            return true;
        }

        toast.error(doResponse.message ?? 'Gagal menyimpan');
        return false;
    }

    function submitForm(){
        if(!form.NAMA.trim())  return toast.error('Nama wajib diisi');
        if(!form.EMAIL.trim()) return toast.error('Email wajib diisi');
        if(!editing && form.PASSWORD.length < 8) return toast.error('Password minimal 8 karakter');
        if(editing && form.PASSWORD && form.PASSWORD.length < 8) return toast.error('Password minimal 8 karakter');

        const label = editing ? `Simpan perubahan untuk ${form.NAMA}` : `Buat akun ${form.NAMA}`;
        confirmThen(label, async () => {
            editing
                ? await post('Update-Akun', { ID : editing.ID, ...form })
                : await post('Tambah-Akun', { ...form });
        });
    }

    function toggleStatus(row:any){
        const next = row.STATUS === 'Aktif' ? 'Nonaktif' : 'Aktif';
        confirmThen(
            next === 'Nonaktif'
                ? `Nonaktifkan ${row.NAMA} — akun ini tidak akan bisa login`
                : `Aktifkan kembali ${row.NAMA}`,
            async () => { await post('Status-Akun', { ID : row.ID, STATUS : next }); }
        );
    }

    function hapus(row:any){
        confirmThen(
            `Hapus akun ${row.NAMA} permanen — riwayat siapa yang pernah punya akses ikut hilang`,
            async () => { await post('Hapus-Akun', { ID : row.ID }); }
        );
    }
</script>

<svelte:head><title>Manajemen Akun — Kosada</title></svelte:head>

<PageHeader title="Manajemen Akun" description="Akun staf Koperasi Kosada">
    <svelte:fragment slot="meta">
        {#if rows.length > 0}
            <span aria-hidden="true">·</span>
            <span><strong class="text-base-content">{rows.length}</strong> akun</span>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
        {#if admin}
            <button type="button" class="btn btn-primary btn-sm" on:click={openCreate}>
                <Icon name="addMember" size={16} /> Tambah Akun
            </button>
        {/if}
    </svelte:fragment>
</PageHeader>

<div class="px-4 lg:px-8 py-5 space-y-5">
    {#if !admin}
        <div class="alert alert-warning">
            <Icon name="password" size={18} />
            <span>
                Halaman ini hanya untuk akun <strong>Administrator</strong>. Anda bisa melihat
                daftar akun, tetapi tidak bisa mengubahnya.
            </span>
        </div>
    {/if}

    <Panel flush>
        <div class="overflow-x-auto max-h-[70vh]">
            <table class="table-kosada">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Dibuat</th>
                        <th class="text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#if isLoading}
                        <SkeletonRows rows={3} columns={7} />
                    {:else if rows.length === 0}
                        <EmptyState colspan={7} subject="akun" icon="members" />
                    {/if}
                    {#each rows as row, index}
                        <tr>
                            <td class="text-muted">{index + 1}</td>
                            <td class="font-medium whitespace-nowrap">
                                {row.NAMA}
                                {#if row.EMAIL === account?.email}
                                    <span class="badge badge-ghost badge-sm ms-1">Anda</span>
                                {/if}
                            </td>
                            <td class="whitespace-nowrap">{row.EMAIL}</td>
                            <td>
                                <span class="badge badge-sm {row.ROLE === 'Administrator' ? 'badge-primary' : 'badge-ghost'}">
                                    {row.ROLE}
                                </span>
                            </td>
                            <td>
                                <span class="badge badge-sm {row.STATUS === 'Aktif' ? 'badge-success' : 'badge-error badge-outline'}">
                                    {row.STATUS}
                                </span>
                            </td>
                            <td class="whitespace-nowrap text-muted">{row.CREATED_AT}</td>
                            <td>
                                {#if admin}
                                    <div class="flex items-center justify-end gap-1">
                                        <button type="button" class="btn btn-ghost btn-sm" on:click={() => openEdit(row)}>
                                            <Icon name="edit" size={16} /> Ubah
                                        </button>
                                        <button type="button" class="btn btn-ghost btn-sm" on:click={() => toggleStatus(row)}>
                                            {row.STATUS === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                        <button type="button" class="btn btn-ghost btn-sm text-error"
                                            aria-label="Hapus akun {row.NAMA}" on:click={() => hapus(row)}>
                                            <Icon name="trash" size={16} />
                                        </button>
                                    </div>
                                {:else}
                                    <span class="text-muted text-sm">—</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </Panel>

    <p class="text-sm text-muted">
        Akun <strong>Staff</strong> bisa memakai seluruh sistem kecuali mengubah password dan
        mengelola akun. Aturan ini diperiksa di server, bukan hanya disembunyikan di tampilan.
    </p>
</div>

<!-- Create / edit -->
<Drawer bind:open={isForm}
        title={editing ? 'Ubah Akun' : 'Tambah Akun'}
        subtitle={editing ? editing.EMAIL : 'Akun staf baru'}
        width="max-w-lg">
    <div class="space-y-4">
        <div class="form-control">
            <label for="akunNama" class="label"><span class="label-text">Nama</span></label>
            <input id="akunNama" type="text" bind:value={form.NAMA} class="input input-bordered" placeholder="Nama lengkap"/>
        </div>

        <div class="form-control">
            <label for="akunEmail" class="label"><span class="label-text">Email</span></label>
            <input id="akunEmail" type="email" bind:value={form.EMAIL} class="input input-bordered" placeholder="nama@kosada.id"/>
            <span class="label-text-alt mt-1">Email ini dipakai untuk login.</span>
        </div>

        <div class="form-control">
            <label for="akunRole" class="label"><span class="label-text">Role</span></label>
            <select id="akunRole" bind:value={form.ROLE} class="select select-bordered">
                <option value="Staff">Staff — semua kecuali password &amp; akun</option>
                <option value="Administrator">Administrator — akses penuh</option>
            </select>
        </div>

        <div class="form-control">
            <label for="akunPassword" class="label">
                <span class="label-text">{editing ? 'Password Baru' : 'Password'}</span>
            </label>
            <input id="akunPassword" type="password" bind:value={form.PASSWORD} class="input input-bordered"
                   placeholder={editing ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}/>
            {#if editing}
                <span class="label-text-alt mt-1">
                    Staff tidak bisa mengubah password sendiri, jadi reset di sini adalah satu-satunya
                    cara memulihkan akun yang lupa password.
                </span>
            {/if}
        </div>
    </div>

    <svelte:fragment slot="footer">
        <button type="button" class="btn btn-ghost btn-sm" on:click={() => isForm = false}>Batalkan</button>
        <button type="button" class="btn btn-primary btn-sm" on:click={submitForm}>
            {editing ? 'Simpan' : 'Buat Akun'}
        </button>
    </svelte:fragment>
</Drawer>

<!-- Administrator confirmation. Required by the server on every mutation. -->
<div class="modal" class:modal-open={isConfirm}>
    <div class="modal-box">
        <button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                on:click={() => isConfirm = false}>✕</button>
        <h2 class="font-semibold">Konfirmasi Administrator</h2>
        <p class="py-2 text-sm">{pendingLabel}</p>

        <div class="form-control mt-2">
            <label for="konfirmasiPassword" class="label">
                <span class="label-text">Password Anda ({account?.email ?? '-'})</span>
            </label>
            <input id="konfirmasiPassword" type="password" bind:value={confirmPassword}
                   class="input input-bordered" placeholder="Masukkan password Anda"
                   on:keydown={(e) => e.key === 'Enter' && runPending()}/>
            <span class="label-text-alt mt-1">
                Server memverifikasi password ini dan memastikan akun Anda Administrator.
            </span>
        </div>

        <div class="card-actions justify-end mt-4">
            <button type="button" class="btn btn-ghost btn-sm" on:click={() => isConfirm = false}>Batalkan</button>
            <button type="button" class="btn btn-primary btn-sm" on:click={runPending} disabled={isSaving}>
                {#if isSaving}
                    <span class="loading loading-spinner loading-xs"></span> Memproses..
                {:else}
                    Lanjutkan
                {/if}
            </button>
        </div>
    </div>
</div>
