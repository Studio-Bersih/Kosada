/*
| Who is currently signed in.
|
| IMPORTANT: this is NOT authentication. Kosada has no session, no token and no
| middleware on any API route -- every page and endpoint is reachable by typing a
| URL. This module only remembers which account was used at the login screen so
| Manajemen Akun knows which account is acting. Treat it as a
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

/*
| Whether the signed-in account is an Administrator.
|
| Used ONLY to decide what to show. It is not a security check and must never be
| treated as one — this reads localStorage, which the user can edit, and there is
| no session to verify it against.
|
| The real enforcement is server-side: Ganti-Password refuses non-Administrator
| Kosada accounts, and every account-management endpoint re-verifies an
| administrator's email and password on the request itself. Someone who edits
| this value gets a menu item that fails the moment they use it.
*/
export function isAdmin(account:KosadaAccount | null):boolean {
    return account?.privilege === 'Administrator';
}

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
