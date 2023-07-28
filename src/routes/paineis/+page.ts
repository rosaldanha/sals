import { getPanels,getAllEntities, getEspHomeEntitiesIdToWatch } from '$lib/server/hassfunctions';
import { env } from '$env/dynamic/public';

//changed +page.server.ts to +page.ts  try to fix error
/** @type {import('./$types').PageServerLoad} */
export async function load() {    
    const panelsInterfaces =  await getPanels();    
    const entitiesIdToChoose = await getAllEntities();
    const esphomeEntitiesToWatch = await getEspHomeEntitiesIdToWatch();
    //console.log('esphomeEntitiesToWatch page.server.ts',esphomeEntitiesToWatch);
    //console.dir(panels, { depth: null });
    //console.log(panels[0].toJson());
    return {panelsInterfaces,
            entitiesIdToChoose,  
            esphomeEntitiesToWatch,
            esphomeServer: env.PUBLIC_ESPHOME_SERVER,              
            homeAssistantUrl: env.PUBLIC_HOMEASSISTANT_URL,
            accessToken: env.PUBLIC_ACCESSTOKEN  } ;
}