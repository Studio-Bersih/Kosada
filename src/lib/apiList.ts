/*
| Normalises a list response from the Kosada API.
|
| The list endpoints (Realisasi-Kredit-Range, Semua-Member, Report) used to return
| a bare array. They now return { data, meta } so they can paginate. Reading
| `response.data` off a bare array yields undefined, which silently rendered an
| empty table while the network tab clearly showed records arriving.
|
| That mismatch is not hypothetical: the frontend auto-deploys from `main` via
| Vercel, while Laravel is deployed to cPanel by hand. There is always a window
| where the new frontend is talking to the old backend.
|
| So both shapes are accepted, and a legacy array is PAGINATED CLIENT-SIDE. The
| old backend ignores page/per_page and returns everything — the Dashboard's
| default full-year range is 1,244 loans — and dropping all of that into the DOM
| is exactly the "first load is very heavy" symptom. Slicing here keeps the table
| light and the pagination controls honest no matter which backend answers. The
| wire payload is still large against an old backend; only deploying fixes that.
*/

export type ListMeta = {
    page      : number;
    per_page  : number;
    total     : number;
    last_page : number;
};

export type NormalizedList = {
    data   : any[];
    meta   : ListMeta;
    legacy : boolean;
};

export type NormalizeOptions = {
    page?    : number;
    perPage? : number;
    label?   : string;
};

/*
| These warnings describe a deployment state, not a per-request event, so they are
| emitted once per label. Repeating them on every page change and every keystroke
| buries whatever else is in the console.
*/
const warned = new Set<string>();

function warnOnce(key:string, message:string):void {
    if(warned.has(key)) return;
    warned.add(key);
    console.warn(message);
}

export function normalizeList(response:any, options:NormalizeOptions = {}):NormalizedList {
    const page:number    = Math.max(1, options.page ?? 1);
    const perPage:number = Math.max(1, options.perPage ?? 25);
    const label:string   = options.label ?? 'list';

    // Old backend: everything in one bare array, page/per_page ignored.
    if(Array.isArray(response)){
        const total:number     = response.length;
        const lastPage:number  = Math.max(1, Math.ceil(total / perPage));
        const safePage:number  = Math.min(page, lastPage);
        const start:number     = (safePage - 1) * perPage;

        warnOnce(`legacy:${label}`,
            `[Kosada] ${label}: the API returned ${total} rows unpaginated. ` +
            `This backend predates the pagination change — apply the SQL and deploy ` +
            `Marmyadose. Paginating client-side so the page stays responsive.`
        );

        return {
            data   : response.slice(start, start + perPage),
            meta   : {
                page      : safePage,
                per_page  : perPage,
                total     : total,
                last_page : lastPage
            },
            legacy : true
        };
    }

    const data:any[] = Array.isArray(response?.data) ? response.data : [];

    return {
        data   : data,
        meta   : response?.meta ?? {
            page      : page,
            per_page  : perPage,
            total     : data.length,
            last_page : 1
        },
        legacy : false
    };
}

/*
| Every row from a list response, whichever shape it arrives in.
|
| For print sheets only. normalizeList() slices a legacy array into pages, which
| is right for a screen and catastrophic for a printout — a monthly report that
| silently prints its first 25 rows is worse than one that fails outright.
*/
export function readListAll(response:any):any[] {
    if(Array.isArray(response)) return response;
    return Array.isArray(response?.data) ? response.data : [];
}

/*
| Reads a JSON array from a response, tolerating a backend that doesn't have the
| route yet.
|
| A missing route returns 404 with a JSON *object* ({"message": "..."}), not an
| array. Assigning that straight to a variable the UI later calls .includes() on
| throws "includes is not a function" — which is what happened with Status-Macet
| against the undeployed backend.
*/
export async function readJsonArray(response:Response, label = 'request'):Promise<any[]> {
    if(!response.ok){
        warnOnce(`http:${label}:${response.status}`,
            response.status === 404
                ? `[Kosada] ${label}: route not found (404). This backend predates the feature — ` +
                  `deploy Marmyadose. Continuing without it.`
                : `[Kosada] ${label}: HTTP ${response.status}. Treating as empty.`
        );
        return [];
    }

    try {
        const parsed = await response.json();
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        warnOnce(`parse:${label}`, `[Kosada] ${label}: response was not valid JSON. Treating as empty.`);
        return [];
    }
}
