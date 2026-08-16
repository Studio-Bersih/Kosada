<script lang="ts">
    /*
    | The app shell's navigation.
    |
    | Replaces the old top navbar. Two reasons it is a sidebar: the nav grew from
    | 6 items to 9 and a horizontal bar was already crowding, and the tables are
    | the densest surface in the app so vertical space is worth more than
    | horizontal.
    |
    | Collapses to a ~64px icon rail rather than disappearing — navigation stays
    | one click away while the tables gain ~180px. The state persists per browser.
    */
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import Icon from '$lib/Icon.svelte';
    import { theme } from '$lib/theme';
    import { getAccount, clearAccount, isAdmin, type KosadaAccount } from '$lib/session';

    const COLLAPSE_KEY = 'kosada.sidebar.collapsed';

    let collapsed = false;
    let mobileOpen = false;
    let account:KosadaAccount | null = null;
    let admin = false;

    /*
    | Grouped by job rather than listed flat: the two pages staff open every day
    | sit at the top, and the sections give the eye somewhere to land now that
    | there are nine destinations.
    */
    const GROUPS = [
        {
            label : '',
            items : [
                { href : '/dashboard',       label : 'Dashboard',        icon : 'dashboard' },
                { href : '/transfer-harian', label : 'Transfer Harian',  icon : 'transfer'  }
            ]
        },
        {
            label : 'DATA',
            items : [
                { href : '/member',        label : 'Anggota Koperasi', icon : 'members'   },
                { href : '/tambah-member', label : 'Tambah Anggota',   icon : 'addMember' },
                { href : '/tambah-kredit', label : 'Tambah Kredit',    icon : 'addCredit' }
            ]
        },
        {
            label : 'LAPORAN',
            items : [
                { href : '/report',     label : 'Laporan',    icon : 'report' },
                { href : '/data-macet', label : 'Data Macet', icon : 'macet'  }
            ]
        },
        {
            label : 'LAIN',
            items : [
                { href : '/surat-tugas',    label : 'Surat Tugas',    icon : 'surat'    },
                // Administrator only. This hides the link; the server is what
                // actually refuses a Staff account.
                { href : '/akun',           label : 'Manajemen Akun', icon : 'members',  adminOnly : true }
            ]
        }
    ];

    // Groups with nothing visible for this role are dropped, so a Staff user
    // doesn't get an empty "LAIN" heading with one item under it.
    $: visibleGroups = GROUPS
        .map(g => ({ ...g, items : g.items.filter(i => !(i as any).adminOnly || admin) }))
        .filter(g => g.items.length > 0);

    onMount(() => {
        theme.init();
        account = getAccount();
        admin   = isAdmin(account);
        try { collapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { /* ignore */ }
    });

    function toggleCollapse(){
        collapsed = !collapsed;
        try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch { /* ignore */ }
    }

    function keluar(){
        clearAccount();
        const cookies = document.cookie.split(';');
        for(const cookie of cookies){
            const eq = cookie.indexOf('=');
            const name = eq > -1 ? cookie.substring(0, eq) : cookie;
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }

    // Exact match, not startsWith: /report must not light up on /report/print.
    $: current = $page.url.pathname;

    // $theme may be 'system', so resolve it — comparing the raw choice would show
    // the wrong icon for anyone who has never touched the toggle.
    $: isDark = theme.resolved($theme) === 'kosada-dark';
</script>

<!-- Mobile: a drawer, opened from a floating button. -->
<button
    type="button"
    class="btn btn-square btn-sm fixed top-3 left-3 z-50 lg:hidden no-print"
    aria-label="Buka menu"
    on:click={() => mobileOpen = true}>
    <Icon name="menu" />
</button>

{#if mobileOpen}
    <button
        type="button"
        class="fixed inset-0 bg-black/40 z-40 lg:hidden"
        aria-label="Tutup menu"
        on:click={() => mobileOpen = false}></button>
{/if}

<!--
  | The width transition is the one place this app animates a layout property.
  | A rail that reclaims horizontal space cannot be done with transform alone —
  | the main content has to take the space back, and transform would leave a hole.
  |
  | Measured cost: ~6 dropped frames over the 160ms transition, because the main
  | content (a 25-row table) re-lays-out each frame. `contain` on this element was
  | tried and made no difference — the reflow is in the flex sibling, not here.
  | Accepted as an explicit trade: it is one deliberate click, not something that
  | fires during scrolling or typing, and the alternative is the jump it used to
  | do. The duration is kept short partly to narrow that window.
  |
  | Before this it had transition-transform only, so the width change jumped.
-->
<aside
    class="bg-base-100 border-r border-base-300 flex flex-col shrink-0 no-print
           fixed inset-y-0 left-0 z-40
           lg:static lg:translate-x-0
           {mobileOpen ? 'translate-x-0' : '-translate-x-full'}"
    style="width: {collapsed ? '4rem' : '15rem'};
           transition: width var(--dur-fast) var(--ease-in-out),
                       transform var(--dur-base) var(--ease-out);">

    <!-- Brand + collapse -->
    <div class="flex items-center gap-2 h-14 px-3 border-b border-base-300 shrink-0">
        <button
            type="button"
            class="btn btn-ghost btn-sm btn-square shrink-0"
            title={collapsed ? 'Perlebar menu' : 'Perkecil menu'}
            aria-label={collapsed ? 'Perlebar menu' : 'Perkecil menu'}
            on:click={toggleCollapse}>
            <Icon name={collapsed ? 'expand' : 'collapse'} />
        </button>
        {#if !collapsed}
            <a href="/dashboard" class="font-bold tracking-tight truncate">KOSADA</a>
        {/if}
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto py-2">
        {#each visibleGroups as group}
            {#if group.label && !collapsed}
                <p class="px-4 pt-4 pb-1 text-[0.65rem] font-semibold tracking-widest text-muted">
                    {group.label}
                </p>
            {:else if group.label}
                <div class="mx-3 my-2 border-t border-base-300"></div>
            {/if}

            <ul class="px-2">
                {#each group.items as item}
                    <li>
                        <a
                            href={item.href}
                            title={collapsed ? item.label : ''}
                            aria-current={current === item.href ? 'page' : undefined}
                            on:click={() => mobileOpen = false}
                            class="flex items-center gap-3 rounded-lg px-2 py-2 my-0.5 transition-colors
                                   {current === item.href
                                       ? 'bg-primary text-primary-content font-semibold'
                                       : 'hover:bg-base-300/60'}
                                   {collapsed ? 'justify-center' : ''}">
                            <Icon name={item.icon} />
                            {#if !collapsed}
                                <span class="truncate text-sm">{item.label}</span>
                            {/if}
                        </a>
                    </li>
                {/each}
            </ul>
        {/each}
    </nav>

    <!-- Account, theme, keluar -->
    <div class="border-t border-base-300 p-2 shrink-0">
        {#if !collapsed && account?.name}
            <p class="px-2 pb-2 text-xs text-muted truncate" title={account.email}>
                {account.name}
            </p>
        {/if}

        <button
            type="button"
            class="flex items-center gap-3 w-full rounded-lg px-2 py-2 hover:bg-base-300/60 transition-colors
                   {collapsed ? 'justify-center' : ''}"
            title={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            on:click={() => theme.toggle()}>
            <Icon name={isDark ? 'sun' : 'moon'} />
            {#if !collapsed}
                <span class="text-sm">{isDark ? 'Mode Terang' : 'Mode Gelap'}</span>
            {/if}
        </button>

        <a
            href="/"
            on:click={keluar}
            title={collapsed ? 'Keluar' : ''}
            class="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-error/10 hover:text-error transition-colors
                   {collapsed ? 'justify-center' : ''}">
            <Icon name="logout" />
            {#if !collapsed}
                <span class="text-sm">Keluar</span>
            {/if}
        </a>
    </div>
</aside>
