/*
| Must stay derived from the build mode — never hardcoded.
|
| `import.meta.env.DEV` is true under `vite dev` and false in a production build,
| so local development reaches the local Laravel and a deploy reaches the real API
| without anyone remembering to flip anything.
|
| Both hardcoded values have already caused real problems: `true` points a
| production deploy at localhost:8000 and the app goes blank, while `false` sends
| local development to the live API — which is how the dashboard ended up loading
| 1,244 production loans and 404ing on routes that only exist locally.
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
