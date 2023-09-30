import { baseConfiguration } from '$lib/baseConfig.js';

export const load = async ({fetch,params}) => {

    const doGet = await fetch(baseConfiguration.defaultURL + 'Detail-Kredit/' + params.slugs);
    const doResponse = await doGet.json();
    return {
        data : doResponse.data
    }
}