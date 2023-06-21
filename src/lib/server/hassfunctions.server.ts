import type { Device, Entity, Panel } from '$lib/hassinterfaces.js';
import { env } from '$env/dynamic/private';





export async function getEntityState(entityId:string){
    let entityState: Entity = {
        entity_id:'',
        state: '',
        attributes: {},
        last_changed: '',
        last_updated: ''
    };
    try {
        const urlForState = `${env.HOMEASSISTANT_URL}/api/states/${entityId}`;
        //console.log(urlForState);
        const response = await fetch(urlForState, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${env.ACCESSTOKEN}`,
            },
          });
        entityState = await response.json();

    } catch (e) {
         console.log(e);
    }
    return entityState;
}
export async function getTemplateResolved(templateStr:string) {
    let jsonResult: string = '';
    try {
        // Monta o objeto de dados para a requisição
        const data = {
          template: templateStr,
        };    
        // Faz a requisição POST para executar o template
        const response = await fetch(`${env.HOMEASSISTANT_URL}/api/template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.ACCESSTOKEN}`,
          },
          body: JSON.stringify(data),
        });
    
        if (!response.ok) {
          throw new Error('Erro na requisição: ' + response.status);
        }
        jsonResult = await response.json();   
        
    }
    catch(e){
        console.log(e);
    }
    return jsonResult;
}
async function getDeviceId(entityId:string) {
    const template = `{{  device_id('${entityId}') | to_json()  }}`;    
    const deviceId = await getTemplateResolved(template);
    
    return deviceId;
}
async function getDeviceEntities(deviceId:string){
    const template = `{{ device_entities('${deviceId}') | to_json }}`
    let entitiesTxt = await getTemplateResolved(template);    
    return entitiesTxt;
}
async function getDeviceArea(deviceId:string) {
  const template = `{{ area_name('${deviceId}') | to_json }}`
  let entitiesTxt = await getTemplateResolved(template);  
  //console.log(entitiesTxt,'devicearea');  
  return entitiesTxt;
}
export async function getEsphomeDevices(){
    let entidades: string[] = [];
    let devices: Device[] = [];
    let devicesNames: String[] = [];

    try {
        const template = "{{  integration_entities('esphome') | to_json }}";

        // Monta o objeto de dados para a requisição
        const data = {
          template: template,
        };    
        // Faz a requisição POST para executar o template
        const response = await fetch(`${env.HOMEASSISTANT_URL}/api/template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.ACCESSTOKEN}`,
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
           
          throw new Error('Erro na requisição: ' + response.status);
        }
        // Lista de Entidades
        // let tmpentidades = await response.text();
        // tmpentidades = tmpentidades.replaceAll('"','');
        // tmpentidades = tmpentidades.replaceAll("'",'"');
        // entidades = JSON.parse(tmpentidades);
        entidades = await response.json();

        for (const entity of entidades){
            if (entity.includes('smr2')) {
                const device = entity.split('.')[1].split('_')[0];
                if ( ! devicesNames.includes(device) ){
                    devicesNames.push(device);
                    const deviceId = await getDeviceId(entity);
                    const deviceEntities = await getDeviceEntities(deviceId);
                    const deviceArea = await getDeviceArea(deviceId);
                    let tmpEntitiesStates: Entity[] = [];
                    for (const tmpEntity of deviceEntities){
                        const tmpState = await getEntityState(tmpEntity);
                        if (tmpState.entity_id){
                          tmpEntitiesStates.push(tmpState);
                        }
                        else{
                          console.log('tmpEntityError',tmpEntity);
                        }
                        
                    }
                    devices.push({
                            device_id : deviceId,
                            device_name: device,
                            device_area: deviceArea,
                            device_entities: tmpEntitiesStates
                        });
                }
            }
            

        }
        for (const device of devices){

        }
        // console.log(devices);
    }
    catch(e){
        console.log(e);
    }
        return {
            entidades:entidades,
            devices:devices
        }
}
export async function getPanels() {
  const { devices } = await getEsphomeDevices();
  const panelDictionary: Map<string, Panel> = new Map();
  
  devices.forEach(device => {
    const entity_panel =
    device.device_entities.find((entity)=>{
      return entity.entity_id === `sensor.${device.device_name}_panel_name`
    });
    if (entity_panel){
      if (panelDictionary.get(entity_panel.state)) {
        panelDictionary.get(entity_panel.state)?.devices.push(device);
      }
      else
      {
        panelDictionary.set(entity_panel.state,{
          panel_area: device.device_area,
          panel_name: entity_panel.state,
          devices: [device]
        })
      }
    }
    
  });
  const panels: Panel[] = [];
  panelDictionary.forEach((pnl)=>{
    panels.push(pnl);
  });

  return panels;
}
export async function getEntities(){
  // {{ states | selectattr('entity_id', 'match', 'iniciacom') | map(attribute='entity_id') | list }}
  const entities = await getTemplateResolved("{{ states | map(attribute='entity_id') | list | to_json}}");
  return entities
}