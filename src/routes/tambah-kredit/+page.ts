import { baseConfiguration } from '$lib/baseConfig.js'

export const load = async ({fetch}) => {
    const doGet = await fetch(baseConfiguration.defaultURL + 'Data-Kredit',{
        method      : 'GET',
        credentials : 'include'
    });
    const doResponse = await doGet.json();
    return {
        unique : doResponse.randomize_ID,
        member : doResponse.memberData
    }
}