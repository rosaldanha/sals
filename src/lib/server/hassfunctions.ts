import type { Device, Entity, Panel } from '$lib/hassinterfaces.js';
import {log,error} from '$lib/logger';
import { env } from '$env/dynamic/public';

export async function getEntityState(entityId:string){  
  let entityState: Entity = {
    entity_id:'',
    state: '',
    attributes: {},
    last_changed: '',
    last_updated: ''
  };
  try {
      const urlForState = `${env.PUBLIC_HOMEASSISTANT_URL}/api/states/${entityId}`;        
      const response = await fetch(urlForState, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '',
            Authorization: `Bearer ${env.PUBLIC_ACCESSTOKEN}`,
          },
          //mode:'no-cors',
        });
      entityState = await response.json();

  } catch (e) {
      error(e);
  }
  return entityState;
}

export async function getTemplateResolved(templateStr:string) {
    let jsonResult: any = null;
    //log(env.PUBLIC_ACCESSTOKEN);
    try {
        // Monta o objeto de dados para a requisição
        const dataForBody = {
          template: templateStr,
        };    
        // Faz a requisição POST para executar o template
        const response = await fetch(`${env.PUBLIC_HOMEASSISTANT_URL}/api/template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',            
            Authorization: `Bearer ${env.PUBLIC_ACCESSTOKEN}`,
          },
          mode:'no-cors',
          body: JSON.stringify(dataForBody),
        });
    
        if (!response.ok) {
          throw new Error('Erro na requisição: ' + response.status);
        }
        jsonResult = await response.json();   
        
    }
    catch(e){
        error(e);
    }
    return jsonResult;
}
async function getDeviceId(entityId:string) {
    const template = `{{  device_id('${entityId}') | to_json()  }}`;    
    const deviceId = await getTemplateResolved(template);    
    return deviceId;
}
async function getDeviceName(entityId:string):Promise<string> {
    const template = `{{  device_attr('${entityId}','name') | to_json }}`
    const deviceName = await getTemplateResolved(template);
    return deviceName;
}
async function getDeviceEntities(deviceId:string){
    const template = `{{ device_entities('${deviceId}') | to_json }}`
    let entitiesTxt = await getTemplateResolved(template);    
    return entitiesTxt;
}
async function getDeviceArea(deviceId:string) {
  const template = `{{ area_name('${deviceId}') | to_json }}`
  let entitiesTxt = await getTemplateResolved(template);      
  return entitiesTxt;
}
export async function buildDeviceObj(entityId:string):Promise<Device> {
  const deviceId = await getDeviceId(entityId);
  const deviceName = await getDeviceName(entityId);
  const deviceEntities = await getDeviceEntities(deviceId);
  const deviceArea = await getDeviceArea(deviceId);
  let tmpEntitiesStates: Entity[] = [];
  //TODO: deal with button_pos? here ?
  for (const tmpEntity of deviceEntities){
      const tmpState = await getEntityState(tmpEntity);
      if (tmpState.entity_id){
        tmpEntitiesStates.push(tmpState);
      }
      else{
        log('tmpEntityError',tmpEntity);
      }                        
  }

  return {
    device_id : deviceId,
    device_name: deviceName,
    device_area: deviceArea,
    device_entities: tmpEntitiesStates
  }; 

}

export async function getEsphomeDevices(){
    let entidades: string[] = [];
    let devices: Device[] = [];
    let devicesNames: String[] = [];

    try {
      const template = "{{  integration_entities('esphome') | to_json }}";
      entidades = await getTemplateResolved(template);
      for (const entity of entidades){
          if (entity.includes('smr2')) {
              const device = entity.split('.')[1].split('_')[0];
              if ( ! devicesNames.includes(device) ){
                  devicesNames.push(device);
                  const deviceObj:Device = await buildDeviceObj(entity);
                  devices.push(deviceObj);
              }
          }
      }
    }
    catch(e){
      error(e);
    }
    return {
      entidades:entidades,
      devices:devices
    };
}
function getDeviceButtonPos(device:Device):number{
  const deviceButtonPos: Entity = device.device_entities.find((entity) =>{
      return entity.entity_id === `sensor.${device.device_name}_button_pos`;
  }) || {
    entity_id: '',
    state: '-1',
    attributes: [],
    last_changed: '',
    last_updated: ''
  } ;
  return parseInt(deviceButtonPos.state);
}
export async function getPanelByName(panelName:string) {
  const { devices } = await getEsphomeDevices();
  const panelToReturn: Panel = {
    panel_area: '',
    panel_name: panelName,
    devices: getEmptyDeviceArray()    
  } ;
  devices.forEach(device => {    
    const entity_panel = device.device_entities.find((entity)=>{
      return entity.entity_id === `sensor.${device.device_name}_panel_name`
    });
    if ( entity_panel &&  entity_panel?.state === panelName ){
      panelToReturn.devices[getDeviceButtonPos(device)] = device;
    }
  });
  return panelToReturn;  
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
        const tmpPanel = panelDictionary.get(entity_panel.state);
        tmpPanel!.devices[getDeviceButtonPos(device)] = device;
      }
      else
      { // New Panel ! 
        const tmpPanel = {
          panel_area: device.device_area,
          panel_name: entity_panel.state,
          devices: getEmptyDeviceArray()
        }
        //tmpPanel.devices[]
        tmpPanel.devices[getDeviceButtonPos(device)] = device;
        panelDictionary.set(entity_panel.state, tmpPanel);
        console.log(panelDictionary);
        //[device]
      }
    }    
  });
  const panels: Panel[] = [];
  panelDictionary.forEach((pnl)=>{
    panels.push(pnl);
  });

  return panels;
}
function getEmptyDevice():Device {
  return {
    device_id: '',
    device_name: '',
    device_area: '',
    device_entities: []
  }
}
function getEmptyDeviceArray(): Device[]{
    return [
      getEmptyDevice(),
      getEmptyDevice(),
      getEmptyDevice(),
      getEmptyDevice(),
      getEmptyDevice(),
      getEmptyDevice(),
    ]
}
export async function getAllEntities(){
  // {{ states | selectattr('entity_id', 'match', 'iniciacom') | map(attribute='entity_id') | list }}
  const entities = await getTemplateResolved("{{ states | map(attribute='entity_id') | list | to_json}}");
  return entities
}

export async function getEspHomeEntitiesToWatch(){
  const entities: string[] = [];
  const {devices}= await getEsphomeDevices();
  for (const device of devices) {
      const entity =  device.device_entities.find((element:Entity) => {
          return element.entity_id.startsWith('binary_sensor.');
      } );            
      if (entity){
          entities.push(entity.entity_id);            
      }            
  }
  return entities;
}