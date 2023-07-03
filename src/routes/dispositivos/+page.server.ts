import {getEsphomeDevices} from '$lib/server/hassfunctions.js';


/** @type {import('./$types').PageServerLoad} */
export async function load({ }) {    
     return getEsphomeDevices();
}
