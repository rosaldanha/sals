import {getEsphomeDevices} from '$lib/server/hassfunctions.server.js';


/** @type {import('./$types').PageServerLoad} */
export async function load({ }) {    
     return getEsphomeDevices();
}
