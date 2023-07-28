import { getPanels,getAllEntities, getEspHomeEntitiesIdToWatch, getPanelByName } from '$lib/server/hassfunctions';
import type {  PanelInterface } from '$lib/panel.js';

//TODO: change from $env/dynamic to $env/private
import { env } from '$env/dynamic/public';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch }) {    
    const panelInterface: PanelInterface = await getPanelByName(params.panelName, fetch);
    const entitiesIdToChoose = await getAllEntities(fetch);
    const esphomeEntitiesToWatch = await getEspHomeEntitiesIdToWatch(fetch);
    
    
    return {panelInterface,
            entitiesIdToChoose,  
            esphomeServer: env.PUBLIC_ESPHOME_SERVER, 
            esphomeEntitiesToWatch, 
            homeAssistantUrl: env.PUBLIC_HOMEASSISTANT_URL,
            accessToken: env.PUBLIC_ACCESSTOKEN  } ;
}