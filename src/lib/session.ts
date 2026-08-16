/*
| Who is currently signed in.
|
| IMPORTANT: this is NOT authentication. Kosada has no session, no token and no
| middleware on any API route -- every page and endpoint is reachable by typing a
| URL. This module only remembers which account was used at the login screen so
| the Ganti Password form knows whose password to change. Treat it as a
| convenience label, never as proof of anything.
|
| Real authentication is a separate, larger piece of work; see
| Kosada-Auth-Proposal.md.
*/

const STORAGE_KEY = 'kosada.account';

export type KosadaAccount = {
    email     : string;
    name      : string;
    privilege : string;
};

export function saveAccount(account:KosadaAccount):void {
    if(typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export function getAccount():KosadaAccount | null {
    if(typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    try {
        return JSON.parse(raw) as KosadaAccount;
    } catch {
        // Corrupt entry helps nobody — drop it and behave as signed out.
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function clearAccount():void {
    if(typeof localStorage === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}
