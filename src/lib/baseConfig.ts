const ENV:string = 'development';

export const baseConfiguration = {
    defaultURL : ENV == 'development' ? 'http://localhost:8080/api/Kosada/' : 'https://esdelfron.deabakery.co.id/api/Kosada/'
}