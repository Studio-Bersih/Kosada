import { baseConfiguration } from '$lib/baseConfig.js'
export const load = async ({fetch}) => {
    const doGet = await fetch( baseConfiguration.defaultURL + 'Realisasi-Kredit',{
        method : 'GET',
        credentials : 'include'
    });
    const doResponse = await doGet.json();
    return {
        data : doResponse
    }
}