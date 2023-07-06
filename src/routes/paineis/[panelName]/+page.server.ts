import { getPanels,getAllEntities, getEspHomeEntitiesToWatch, getPanelByName } from '$lib/server/hassfunctions';

//TODO: change from $env/dynamic to $env/private
import { env } from '$env/dynamic/public';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {    
    const panel = await getPanelByName(params.panelName);
    const entities = await getAllEntities();
    const esphomeEntitiesToWatch = await getEspHomeEntitiesToWatch();
    
    
    return {panel,
            entities,  
            esphomeServer: env.PUBLIC_ESPHOME_SERVER, 
            esphomeEntitiesToWatch, 
            homeAssistantUrl: env.PUBLIC_HOMEASSISTANT_URL,
            accessToken: env.PUBLIC_ACCESSTOKEN  } ;
}