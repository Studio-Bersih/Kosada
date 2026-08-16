/*
| Normalises a list response from the Kosada API.
|
| The list endpoints (Realisasi-Kredit-Range, Semua-Member, Report) used to return
| a bare array. They now return { data, meta } so they can paginate. Reading
| `response.data` off a bare array yields undefined, which silently rendered an
| empty table while the network tab clearly showed records arriving — a genuinely
| confusing failure.
|
| That mismatch is not hypothetical: the frontend auto-deploys from `main` via
| Vercel, while Laravel is deployed to cPanel by hand. There is always a window
| where the new frontend is talking to the old backend, and "the app looks empty"
| is the worst way to find out.
|
| So both shapes are accepted. Against an old backend the page degrades to
| unpaginated-but-working instead of blank, and logs a warning naming the cause.
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

export function normalizeList(response:any, fallbackPerPage = 25, label = 'list'):NormalizedList {
    // Old backend: a bare array, no pagination. Present it as a single full page
    // so the pagination controls stay coherent rather than claiming 0 of 1.
    if(Array.isArray(response)){
        console.warn(
            `[Kosada] ${label}: the API returned an unpaginated array. ` +
            `This backend predates the pagination change — apply the SQL and deploy ` +
            `Marmyadose. Showing all ${response.length} rows on one page for now.`
        );
        return {
            data   : response,
            meta   : {
                page      : 1,
                per_page  : Math.max(response.length, 1),
                total     : response.length,
                last_page : 1
            },
            legacy : true
        };
    }

    const data:any[] = Array.isArray(response?.data) ? response.data : [];

    return {
        data   : data,
        meta   : response?.meta ?? {
            page      : 1,
            per_page  : fallbackPerPage,
            total     : data.length,
            last_page : 1
        },
        legacy : false
    };
}
