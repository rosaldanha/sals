import { env } from '$env/dynamic/private';
import { getEsphomeDevices, getAllEntities } from '$lib/server/hassfunctions.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ }) {   
    
    const { devices } = await getEsphomeDevices();
    const entities = await getAllEntities();
    return {
        homeAssistantUrl:env.HOMEASSISTANT_URL , 
        accessToken: env.ACCESSTOKEN,
        esphomeServer: env.ESPHOME_SERVER,
        entities,
        devices };
}