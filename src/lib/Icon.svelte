<script lang="ts">
    /*
    | The app's icon set — inline SVG, no dependency.
    |
    | One component with a `name` prop rather than 15 separate files: every icon
    | then shares the same viewBox, stroke width and sizing by construction, which
    | is the thing that usually drifts when icons are hand-placed one at a time.
    |
    | All paths are 24x24, stroke-based, and inherit currentColor.
    */
    export let name:string;
    export let size:number = 20;
    /* Tailwind classes for the <svg> itself. */
    let klass = '';
    export { klass as class };

    const PATHS:Record<string,string> = {
        // Navigation
        dashboard : 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
        transfer  : 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
        members   : 'M17 20h5v-2a3 3 0 00-5.36-1.9M17 20H7m10 0v-2c0-.66-.13-1.3-.36-1.9m0 0A5 5 0 0012 13a5 5 0 00-4.64 3.1M7 20H2v-2a3 3 0 015.36-1.9M7 20v-2c0-.66.13-1.3.36-1.9m0 0a5 5 0 014.64-3.1M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        addMember : 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M13 7a4 4 0 11-8 0 4 4 0 018 0zM20 8v6M23 11h-6',
        addCredit : 'M12 8v8m-4-4h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        report    : 'M9 17v-6m3 6V7m3 10v-4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z',
        macet     : 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
        surat     : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.59a1 1 0 01.7.29l4.42 4.42a1 1 0 01.29.7V19a2 2 0 01-2 2z',
        password  : 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',

        // Actions
        search    : 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
        detail    : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z',
        print     : 'M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z',
        trash     : 'M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6',
        edit      : 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
        whatsapp  : 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',

        // Shell
        collapse  : 'M11 19l-7-7 7-7m8 14l-7-7 7-7',
        expand    : 'M13 5l7 7-7 7M5 5l7 7-7 7',
        menu      : 'M4 6h16M4 12h16M4 18h16',
        logout    : 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
        sun       : 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z',
        moon      : 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
        empty     : 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4.5l-1.5 3h-4l-1.5-3H4',
        check     : 'M20 6L9 17l-5-5'
    };
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class={klass}>
    <path d={PATHS[name] ?? PATHS.empty} />
</svg>
