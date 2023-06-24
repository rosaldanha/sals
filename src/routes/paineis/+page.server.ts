import { getPanels,getEntities } from '$lib/server/hassfunctions.server';
import { env } from '$env/dynamic/private';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {    
    const panels = getPanels();
    const entities = getEntities();
    console.log( {panels,entities});
    return {panels,entities,  esphomeServer: env.ESPHOME_SERVER} ;
}