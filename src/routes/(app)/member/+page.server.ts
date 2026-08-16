import { baseConfiguration } from '$lib/baseConfig.js'
import { normalizeList } from '$lib/apiList.js';
import { marketing } from '$lib/strings/marketing.js';
import { kumpulanProvinsi } from '$lib/strings/provinsi.js';

export const load = async ({fetch}) => {
    // First page only. Semua-Member is paginated — it used to return all 2,736
    // members (901 KB) on every visit.
    const doGet = await fetch(baseConfiguration.defaultURL + 'Semua-Member?page=1&per_page=25',{
        method      : 'GET',
    });
    const list = normalizeList(await doGet.json(), { page : 1, perPage : 25, label : 'Semua-Member (SSR)' });
    return {
        data : list.data,
        meta : list.meta,
        provinsi : kumpulanProvinsi,
        marketing : marketing
    }
}