import { env } from '$env/dynamic/private';
import { getEsphomeDevices, getEntities } from '$lib/server/hassfunctions.server.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ }) {   
    
    const { devices } = await getEsphomeDevices();
    const entities = await getEntities();
    return {
        homeAssistantUrl:env.HOMEASSISTANT_URL , 
        accessToken: env.ACCESSTOKEN,
        esphomeServer: env.ESPHOME_SERVER,
        entities,
        devices };
}