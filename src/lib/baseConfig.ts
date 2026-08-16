/*
| Must stay derived from the build mode. Hardcoding this to `true` points a
| production deploy at localhost:8000 and the whole app goes blank.
*/
const isDevelopment:boolean = import.meta.env.DEV;

/*
| Upstream Laravel API. Only ever reached from the server — the +page.server.ts
| loads and the proxy in src/routes/api/[...path] — so those requests carry no
| Origin header and CORS never applies to them.
*/
const apiRoot:string = isDevelopment ? 'http://localhost:8000/api/' : 'https://fae.deabakery.co.id/api/';

export const baseConfiguration = {
    apiRoot    : apiRoot,
    defaultURL : apiRoot + 'Kosada/',

    /*
    | What the browser talks to instead. Same-origin, so there is no CORS check
    | and no preflight, and the hop to Laravel is made by Vercel rather than
    | over the user's own connection.
    */
    clientURL  : '/api/Kosada/'
}
