const ENV:string = 'production';

export const baseConfiguration = {
    defaultURL : ENV == 'development' ? 'http://localhost:8000/api/Kosada/' : 'https://fae.deabakery.co.id/api/Kosada/'
}