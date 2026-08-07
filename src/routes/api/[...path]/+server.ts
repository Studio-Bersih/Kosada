import type { RequestHandler } from './$types';
import { baseConfiguration } from '$lib/baseConfig';

/*
| Same-origin proxy to the Laravel API.
|
| The browser used to call fae.deabakery.co.id directly, which made every
| request cross-origin: it had to match the CORS allowlist, a JSON body forced
| a preflight, and it travelled over the user's own ISP. Requests now stop
| here and Vercel makes the upstream call instead.
|
| The path is passed straight through, so '/api/Kosada/Status-Lunas' reaches
| '<apiRoot>Kosada/Status-Lunas' and the login screen's '/api/UD84/Auth' keeps
| working without a special case.
*/
async function forward(request:Request, path:string, search:string):Promise<Response>{
    const method:string = request.method;
    const headers:Headers = new Headers({ 'Accept' : 'application/json' });

    const contentType:string | null = request.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);

    const upstream:Response = await fetch(baseConfiguration.apiRoot + path + search, {
        method  : method,
        headers : headers,
        body    : method === 'GET' || method === 'HEAD' ? undefined : await request.text()
    });

    return new Response(await upstream.text(), {
        status  : upstream.status,
        headers : {
            'Content-Type'  : upstream.headers.get('content-type') ?? 'application/json',
            'Cache-Control' : 'no-store'
        }
    });
}

export const GET    : RequestHandler = ({ request, params, url }) => forward(request, params.path, url.search);
export const POST   : RequestHandler = ({ request, params, url }) => forward(request, params.path, url.search);
export const PUT    : RequestHandler = ({ request, params, url }) => forward(request, params.path, url.search);
export const PATCH  : RequestHandler = ({ request, params, url }) => forward(request, params.path, url.search);
export const DELETE : RequestHandler = ({ request, params, url }) => forward(request, params.path, url.search);
