import type { EntityInterface } from '$lib/entity';
import { emptyEntityInterface } from '$lib/entity';
import { emptyPanelInterface } from '$lib/panel';
import type { PanelInterface } from '$lib/panel';
import type {  DeviceInterface   } from '$lib/device';
import { getDeviceButtonFromInterface,getDevicePanelNameFromInterface, getDeviceStatusId } from '$lib/device';
import {log,error,logF} from '$lib/logger';
import { env } from '$env/dynamic/public';

export async function getEntityState(entityId:string) :Promise<EntityInterface> {  
  let entityState: EntityInterface = emptyEntityInterface();
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
      entityState = await response.json() as EntityInterface;

  } catch (e) {
      error(e);
  }
  //console.log('getEntityState',entityState)
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
async function getDeviceId(entityId:string):Promise<string> {
    const template = `{{  device_id('${entityId}') | to_json()  }}`;    
    const deviceId = await getTemplateResolved(template);    
    return deviceId;
}
async function getDeviceName(entityId:string):Promise<string> {
    const template = `{{  device_attr('${entityId}','name') | to_json }}`
    const deviceName = await getTemplateResolved(template);
    return deviceName;
}
async function getDeviceEntities(deviceId:string):Promise<string[]>{
    const template = `{{ device_entities('${deviceId}') | to_json }}`
    let entitiesTxt = await getTemplateResolved(template);    
    return entitiesTxt;
}
async function getDeviceArea(deviceId:string) {
  const template = `{{ area_name('${deviceId}') | to_json }}`
  let entitiesTxt = await getTemplateResolved(template);      
  return entitiesTxt;
}
export async function buildDeviceObj(entityId:string):Promise<DeviceInterface> {
  const deviceId = await getDeviceId(entityId);
  const deviceName = await getDeviceName(entityId);
  const deviceEntities = await getDeviceEntities(deviceId);
  const deviceArea = await getDeviceArea(deviceId);
  let tmpEntitiesStates: EntityInterface[] = [];
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
    device_id: deviceId,
    device_name: deviceName,
    device_area: deviceArea,        
    device_config: '',
    device_entities: tmpEntitiesStates
  }; 

}

export async function getEsphomeDevices(){
    let entidades: string[] = [];
    let devices: DeviceInterface[] = [];
    let devicesNames: String[] = [];

    try {
      const template = "{{  integration_entities('esphome') | to_json }}";
      entidades = await getTemplateResolved(template);
      for (const entity of entidades){
          if (entity.includes('smr2')) {
              const device = entity.split('.')[1].split('_')[0];
              if ( ! devicesNames.includes(device) ){
                  devicesNames.push(device);
                  const deviceObj:DeviceInterface = await buildDeviceObj(entity);
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

export async function getPanelByName(panelName:string):Promise<PanelInterface> {
  const { devices } = await getEsphomeDevices();
  const panelToReturn: PanelInterface = emptyPanelInterface(panelName);
  
  devices.forEach(device => {
    if ( getDevicePanelNameFromInterface(device) === panelName ){
      panelToReturn.devices[getDeviceButtonFromInterface(device)] = device;
    }
  });
  return panelToReturn;  
}
export async function getPanels() {
  const { devices } = await getEsphomeDevices();
  
  let panelDictionary: Record<string, PanelInterface> = {};  
  devices.forEach(device => {    
    const deviceInterfacePanelName = getDevicePanelNameFromInterface(device);
    const deviceInterfaceButtonPos = getDeviceButtonFromInterface(device);
    //console.log('getPanels() =>',device.device_name,deviceInterfacePanelName,deviceInterfaceButtonPos)
    if ( deviceInterfacePanelName !== ''){
      if (deviceInterfacePanelName in panelDictionary) {
        panelDictionary[deviceInterfacePanelName]!.devices[deviceInterfaceButtonPos] = device ;
        
      }
      else
      { // New Panel ! 
        panelDictionary[deviceInterfacePanelName] = emptyPanelInterface(deviceInterfacePanelName);        
        panelDictionary[deviceInterfacePanelName]!.devices[deviceInterfaceButtonPos] = device;
      }
    }    
  });
  const panels: PanelInterface[] = Object.values(panelDictionary);  
  console.log(panelDictionary);
  return panels;
}


export async function getAllEntities(){
  // {{ states | selectattr('entity_id', 'match', 'iniciacom') | map(attribute='entity_id') | list }}
  const entities = await getTemplateResolved("{{ states | map(attribute='entity_id') | list | to_json}}");
  return entities
}

export async function getEspHomeEntitiesIdToWatch():Promise<string[]>{
  const entitiesIdToWatch: string[] = [];
  const {devices}= await getEsphomeDevices();
  for (const device of devices) {    
    entitiesIdToWatch.push(getDeviceStatusId(device));
  }
  return entitiesIdToWatch;
}