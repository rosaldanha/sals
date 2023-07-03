import { getPanels,getAllEntities, getEspHomeEntitiesToWatch } from '$lib/server/hassfunctions';
import { env } from '$env/dynamic/public';
/** @type {import('./$types').PageServerLoad} */
export async function load() {    
    const panels = await getPanels();
    const entities = await getAllEntities();
    const esphomeEntitiesToWatch = await getEspHomeEntitiesToWatch();
    
    
    return {panels,
            entities,  
            esphomeServer: env.PUBLIC_ESPHOME_SERVER, 
            esphomeEntitiesToWatch, 
            homeAssistantUrl: env.PUBLIC_HOMEASSISTANT_URL,
            accessToken: env.PUBLIC_ACCESSTOKEN  } ;
}