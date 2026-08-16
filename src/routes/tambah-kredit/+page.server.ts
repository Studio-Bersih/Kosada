import { baseConfiguration } from '$lib/baseConfig.js'

export const load = async ({fetch}) => {
    const doGet = await fetch(baseConfiguration.defaultURL + 'Data-Kredit',{
        method      : 'GET',
    });
    const doResponse = await doGet.json();
    return {
        // Members are no longer sent up front — the page uses the typeahead at
        // /Kosada/Cari-Member. This used to ship all 2,736 of them (311 KB).
        unique : doResponse.randomize_ID
    }
}