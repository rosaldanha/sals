
import type { Device, Entity } from "./hassinterfaces";
import { logF } from "./logger";
import YAML from 'yaml';

enum ENTITYIDTYPE {
    CONTROLTYPE,
    CONTROLS,
    PANELNAME,
    BUTTONPOS,
    LIGHT
}
const UNAVAILABLE_STATE: string = 'unavailable';
const CONTROL_TYPE_DISABLED: string = 'disabled';
const NO_RELAY = 'noRelay';
const NO_CONTROL = 'noControl';

export class DeviceConfig {
    
    public constructor(private readonly device: Device) {
        logF('constructor',this.device);
    }

    private getEntityId(idType:ENTITYIDTYPE): string{
        switch (idType) {
            case ENTITYIDTYPE.CONTROLTYPE:
                return `sensor.${this.device.device_name}_control_type`;
                break;
            case ENTITYIDTYPE.CONTROLS:
                return `sensor.${this.device.device_name}_controls`;
                break;
            case ENTITYIDTYPE.PANELNAME:
                return `sensor.${this.device.device_name}_panel_name`;
                break;
            case ENTITYIDTYPE.BUTTONPOS:
                return `sensor.${this.device.device_name}_button_pos`
                break;
            case ENTITYIDTYPE.LIGHT:
                return this.getLightId();    
            //return `light.${this.device.device_name}_luz`
                break;
            default:
                return ''
                break;
        }

    }
    private buildComment(): string {
        let comment: string = '';
        comment += this.getLightId();
        comment += ' | ';
        const controlTypeText: string = this.getState(ENTITYIDTYPE.CONTROLTYPE);
        if (controlTypeText.toLowerCase() === CONTROL_TYPE_DISABLED) {
            comment += 'noControl';
        }
        else {
            comment += this.getState(ENTITYIDTYPE.CONTROLS);
        }

        return `  comment: "${comment}"\n`;
    }
    private getState(entityIdType:ENTITYIDTYPE, defaultValue:string = ""){
        const entityName = this.getEntityId(entityIdType);        
        const tmpEntity: Entity|undefined = 
            this.device.device_entities.find(
                 (entity) =>  { return entityName === entity.entity_id; } );
        if (tmpEntity) {
            //TODO: erro, retornando 0 para panel_name
            return tmpEntity.state;
        }
        else {
            return defaultValue;
        }    
        
    }
    private getLightId(): string{
        //search all device for light.
        const tmpLightEntity: Entity|undefined = this.device.device_entities.find((entity) => {
            return entity.entity_id.startsWith('light.');
        });
        if (tmpLightEntity){
            return tmpLightEntity.entity_id.replace('light.','');
        }
        else{
            return `light.${this.device.device_name}_luz`;
        }       
    }
    private getRelayState(): boolean{
        const lightId = this.getLightId(); 
        return  this.getState(ENTITYIDTYPE.LIGHT) == UNAVAILABLE_STATE;
    }
    public getConfig(): string {       
        let yamlTxt:string = YAML.stringify({
            substitutions:{
                device_name: this.device.device_name,                       
                control_type: this.getState(ENTITYIDTYPE.CONTROLTYPE) ,
                isRelayDisabled: `${this.getRelayState()}`,
                panel_name: this.getState(ENTITYIDTYPE.PANELNAME),
                button_pos: this.getState(ENTITYIDTYPE.BUTTONPOS)
            }},
            {
                defaultStringType: 'QUOTE_DOUBLE',
                defaultKeyType: 'PLAIN',
                trueStr: 'true',
                falseStr: 'false',
                doubleQuotedAsJSON: true
            });
        const controls_state = this.getState(ENTITYIDTYPE.CONTROLS,NO_CONTROL);
        yamlTxt += `  control_list: "${controls_state}"\n`
        yamlTxt += this.buildComment();   
        yamlTxt += '\n<<: !include common/smr2.yaml'
        this.device.device_config = yamlTxt;
        //console.log('deviceConfig:',yamlTxt);
        return yamlTxt;        
    }  
  }


