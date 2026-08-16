import { baseConfiguration } from '$lib/baseConfig.js'
import { marketing } from '../../strings/marketing.js';
import { kumpulanProvinsi } from '../../strings/provinsi.js';

export const load = async ({fetch}) => {
    // First page only. Semua-Member is paginated — it used to return all 2,736
    // members (901 KB) on every visit.
    const doGet = await fetch(baseConfiguration.defaultURL + 'Semua-Member?page=1&per_page=25',{
        method      : 'GET',
    });
    const doResponse = await doGet.json();
    return {
        data : doResponse.data ?? [],
        meta : doResponse.meta ?? { page : 1, per_page : 25, total : 0, last_page : 1 },
        provinsi : kumpulanProvinsi,
        marketing : marketing
    }
}