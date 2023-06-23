import { env } from '$env/dynamic/private';
import { getEsphomeDevices } from '$lib/server/hassfunctions.server.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ }) {   
    
    const { devices } = await getEsphomeDevices();
    return {
        homeAssistantUrl:env.HOMEASSISTANT_URL , 
        accessToken: env.ACCESSTOKEN,
        devices };
}