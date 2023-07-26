import { dev } from '$app/environment';
import { Entity } from '$lib/entity';
import type { EntityInterface } from '$lib/entity';
import  YAML  from 'yaml';
export interface DeviceInterface {
    device_id       : string;
    device_name     : string;
    device_area     : string;
    device_config   : string; 
    device_entities : Record<string, Entity> | EntityInterface[];   
}

export enum control_types {
    disabled,
    generic_toggle
}
export function emptyDeviceInterface() {
    return {
        device_id       : '',
        device_name     : '',
        device_area     : '',
        device_config   : '',
        device_entities : []           
    }   
}

export function getDeviceButtonFromInterface(deviceInterface:DeviceInterface):number {
    if (Array.isArray(deviceInterface.device_entities)) {
        const devButtonPos = deviceInterface.device_entities.find((entity) =>{
            return entity.entity_id === Device.getButtonPosIdForDevice(deviceInterface.device_name);
        });
        if (devButtonPos)
            return parseInt(devButtonPos!.state);
        else
            return -1;
    }
    else
        return -1;
}

export function getDevicePanelNameFromInterface(deviceInterface:DeviceInterface):string {
    if (Array.isArray(deviceInterface.device_entities)) {
        const devPanelName = deviceInterface.device_entities.find((entity) =>{            
            return entity.entity_id === Device.getPanelNameIdForDevice(deviceInterface.device_name);
        });
        if (devPanelName)
            return devPanelName!.state;
        else
            return '';
        
    }
    else
        return ''; 
}
export function getDeviceStatusId(deviceInterface:DeviceInterface):string {
    return Device.getDeviceStatusIdForDevice(deviceInterface.device_name);
}

/**
 * TODO: Doc
 */
export class Device implements DeviceInterface {
    
    static readonly UNAVAILABLE_STATE: string = 'unavailable';
    static readonly NO_BUTTON_POS: number = -1;
    public device_id       : string;
    public device_name     : string;
    public device_area     : string;   
    public device_entities : Record<string, Entity> = {};

    constructor( device:DeviceInterface  ){
        this.device_id = device.device_id;
        this.device_name = device.device_name;
        this.device_area = device.device_area;
        if (Array.isArray(device.device_entities)) {
            device.device_entities.forEach(entityInterface => {
                this.device_entities[entityInterface.entity_id] = new Entity(entityInterface);
            });    
        }
    }


    static emptyDevice():Device {
        return new Device(emptyDeviceInterface()); 
    }
    static getButtonPosIdForDevice(deviceName:string):string {
        return `sensor.${deviceName}_button_pos`;
    }
    static getPanelNameIdForDevice(deviceName:string):string {
        return `sensor.${deviceName}_panel_name`;
    }
    static getDeviceStatusIdForDevice(deviceName:string):string {
        return `binary_sensor.${deviceName}_status`
    }


    
    get controlTypeId(): string {
        return `sensor.${this.device_name}_control_type`;
    }
    get controlType(): string {
        if (this.controlTypeId in this.device_entities)
            return this.device_entities[this.controlTypeId].state;
        else
            return '' //TODO: define const controlTypeDefault
    }
    set controlType(state: string) {
        if (this.controlTypeId in this.device_entities)
            this.device_entities[this.controlTypeId].state = state;
        else
        {
            const tmpControlType: Entity = Entity.emptyEntity(this.controlTypeId,state);
            this.device_entities[this.controlTypeId] = tmpControlType;
        }
    }

    get controlsId(): string {
        return `sensor.${this.device_name}_controls`;
    }
    get controls(): string {
        if (this.controlsId in this.device_entities)
            return this.device_entities[this.controlsId].state;
        else
            return '' //TODO: define const controlsDefault
    }
    set controls(state: string) {
        if (this.controlsId in this.device_entities)
            this.device_entities[this.controlsId].state = state;
        else
        {
            const tmpControls: Entity = Entity.emptyEntity(this.controlsId,state);
            this.device_entities[this.controlsId] = tmpControls;
        }
    }

    get controlsArray(): string[] {
        if (this.controlsId in this.device_entities){
            if (this.device_entities[this.controlsId].state === '') 
                return [];
            else
                return this.device_entities[this.controlsId].state.split(',');
        }
        else
        {
            return [];
        }            
    }
    set controlsArray(array: string[]){
        if (array.length > 0){
            this.device_entities[this.controlsId].state = array.join(',');
        }
        else
        {
            if (this.controlsId in this.device_entities)
                this.device_entities[this.controlsId].state = '';
        }
    }

    get panelNameId(): string {
        return Device.getPanelNameIdForDevice(this.device_name);
    }
    get panelName(): string {
        if (this.panelNameId in this.device_entities)
            return this.device_entities[this.panelNameId].state;
        else
            return '' //TODO: define const controlsDefault
    }
    set panelName(panelName:string) {
        if (this.panelNameId in this.device_entities)
            this.device_entities[this.panelNameId].state = panelName;
        else
        {
            const tmpPanelName: Entity = Entity.emptyEntity(this.panelNameId, '');
            this.device_entities[this.panelNameId] = tmpPanelName;
        }        
    }

    get buttonPosId(): string {
        return Device.getButtonPosIdForDevice(this.device_name);
    }
    get buttonPos(): number {
        if (this.buttonPosId in this.device_entities) {
            return parseInt(this.device_entities[this.buttonPosId].state);
        }
        else {            
            this.device_entities[this.buttonPosId] = Entity.emptyEntity(this.buttonPosId, Device.NO_BUTTON_POS.toString()); 
            return Device.NO_BUTTON_POS;
        }
    }
    set buttonPos(pos:number) {
        if (this.buttonPosId in this.device_entities){
            this.device_entities[this.buttonPosId].state = pos.toString();
        }
        else {              
            this.device_entities[this.buttonPosId] = Entity.emptyEntity(this.buttonPosId, pos.toString());
        }
    }

    get statusId(): string {
        return Device.getDeviceStatusIdForDevice(this.device_name);
    }
    get status(): string {
        if (this.statusId in this.device_entities) {
            return this.device_entities[this.statusId].state;
        }
        else {
            return Device.UNAVAILABLE_STATE;
        }
    }



    get lightId(): string {
        for (const key in this.device_entities) {
            if (key.startsWith('light.'))
                return key;
        }
        return '';
    }
    get light(): string {
        if (this.lightId in this.device_entities)
            return this.device_entities[this.lightId].state;
        else
            return '';
    }

    private _disableRelay:boolean|undefined = undefined;

    get disableRelay():boolean {
        if (this._disableRelay)
            return this._disableRelay!;
        else {
            if (this.lightId === ''){
                this._disableRelay = true;
                return this._disableRelay;
            }
            else
            {
                return this.device_entities[this.lightId].state === Device.UNAVAILABLE_STATE;
            } 
        }
        
    }
    set disableRelay(disable:boolean){
        this._disableRelay = disable;
    }

    get device_comments(): string {
        let comment: string = '';
        if (this.disableRelay)
            comment += 'noRelay';
        else
            comment += this.lightId.replace('light.','');
        comment += ' | ';
        if (this.controlType === control_types.disabled.toString())
            comment += 'noControl';
        else
            comment += this.controls;
        return `  comment: "${comment}"\n`;
    }
    get device_config() : string {
        if (this.device_name === '')
            return '';
        else{
            let yamlTxt: string = YAML.stringify({
             substitutions:{
                 device_name: this.device_name,                       
                 control_type: this.controlType ,
                 isRelayDisabled: `${this.disableRelay}`,
                 panel_name: this.panelName,
                 button_pos: this.buttonPos.toString()            
             }},
             {
                 defaultStringType: 'QUOTE_DOUBLE',
                 defaultKeyType: 'PLAIN',
                 trueStr: 'true',
                 falseStr: 'false',
                 doubleQuotedAsJSON: true
             });
            yamlTxt += `  control_list: "${this.controls}"\n`;
            yamlTxt += this.device_comments;
            yamlTxt += '\n<<: !include common/smr2.yaml'
            return yamlTxt;
        }
    }
}