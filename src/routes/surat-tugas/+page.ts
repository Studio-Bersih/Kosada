import { baseConfiguration } from '$lib/baseConfig.js'

export const load = async ({fetch}) => {
    const doGet = await fetch(baseConfiguration.defaultURL + 'Surat-Tugas',{
        method : 'GET',
    });
    const doResponse = await doGet.json();
    return {
        data : doResponse.data
    }
}