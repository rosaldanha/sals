import { getPanels,getEntities } from '$lib/server/hassfunctions.server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {    
    const panels = getPanels();
    const entities = getEntities();
    console.log( {panels,entities});
    return {panels,entities} ;
}