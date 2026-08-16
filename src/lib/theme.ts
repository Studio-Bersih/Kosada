import { writable } from 'svelte/store';

/*
| Light/dark theme.
|
| Three states, deliberately: "system" follows the OS, and light/dark are
| explicit overrides. A user who has never touched the toggle should track their
| machine's setting — including when it flips at sunset — which a plain boolean
| cannot express.
|
| The value is applied to <html data-theme> BEFORE first paint by the inline
| script in app.html. Doing it here instead would flash the light theme for a
| frame on every load, which is exactly the thing people notice.
*/

export type ThemeChoice = 'system' | 'kosada-light' | 'kosada-dark';

export const STORAGE_KEY = 'kosada.theme';

function resolve(choice:ThemeChoice):'kosada-light' | 'kosada-dark' {
    if(choice !== 'system') return choice;

    const prefersDark = typeof window !== 'undefined'
        && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    return prefersDark ? 'kosada-dark' : 'kosada-light';
}

function readStored():ThemeChoice {
    if(typeof localStorage === 'undefined') return 'system';
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'kosada-light' || raw === 'kosada-dark' ? raw : 'system';
}

function createTheme(){
    const { subscribe, set } = writable<ThemeChoice>('system');

    function apply(choice:ThemeChoice):void {
        if(typeof document === 'undefined') return;
        document.documentElement.setAttribute('data-theme', resolve(choice));
    }

    return {
        subscribe,

        /* Called once on mount to sync the store with what app.html already applied. */
        init(){
            const stored = readStored();
            set(stored);
            apply(stored);

            // Keep following the OS while the user is still on "system".
            if(typeof window !== 'undefined' && window.matchMedia){
                window.matchMedia('(prefers-color-scheme: dark)')
                    .addEventListener('change', () => {
                        if(readStored() === 'system') apply('system');
                    });
            }
        },

        set(choice:ThemeChoice){
            set(choice);
            apply(choice);
            if(typeof localStorage === 'undefined') return;
            choice === 'system'
                ? localStorage.removeItem(STORAGE_KEY)
                : localStorage.setItem(STORAGE_KEY, choice);
        },

        /*
        | What the toggle button does. From "system" it jumps to the opposite of
        | whatever is currently showing, so one click always visibly changes
        | something — landing back on the theme you were already looking at would
        | feel broken.
        */
        toggle(){
            const current = resolve(readStored());
            this.set(current === 'kosada-dark' ? 'kosada-light' : 'kosada-dark');
        },

        resolved:resolve
    };
}

export const theme = createTheme();
