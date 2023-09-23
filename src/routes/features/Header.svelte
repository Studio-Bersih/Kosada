<div class="navbar bg-base-100">
    <div class="navbar-start">
        <div class="dropdown">
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label tabindex="0" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
        </label>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 font-bold">
            <li><a href="/">Dashboard</a></li>
            <li><a href="/">Tambah Anggota</a></li>
            <li><a href="/">Tambah Kredit</a></li>
            <li><a href="/">Realisasi Kredit</a></li>
        </ul>
        </div>
        <a href="/" class="btn btn-ghost normal-case text-xl">Koperasi Kosada</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/tambah-member">Tambah Anggota</a></li>
        <li><a href="/tambah-kredit">Tambah Kredit</a></li>
        <li><a href="/member">Anggota Koperasi</a></li>
      </ul>
    </div>
    <div class="navbar-end">
      <a href="/" class="btn btn-neutral">Keluar</a>
    </div>
  </div>