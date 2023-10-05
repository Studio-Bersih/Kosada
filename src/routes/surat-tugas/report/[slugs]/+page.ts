import { baseConfiguration } from '$lib/baseConfig.js'

export const load = async ({fetch,params}) => {
    const doGet = await fetch(baseConfiguration.defaultURL + 'Surat-Tugas/Lihat/' + params.slugs,{
        method : 'GET',
        // credentials : 'include'
    });
    const doResponse = await doGet.json();
    return {
        data : doResponse.data
    }
}