import { baseConfiguration } from '$lib/baseConfig.js'
import { marketing } from '../../strings/marketing.js';
import { kumpulanProvinsi } from '../../strings/provinsi.js';

export const load = async ({fetch}) => {
    const doGet = await fetch(baseConfiguration.defaultURL + 'Semua-Member',{
        method      : 'GET',
    });
    const doResponse = await doGet.json();
    return {
        data : doResponse,
        provinsi : kumpulanProvinsi,
        marketing : marketing
    }
}