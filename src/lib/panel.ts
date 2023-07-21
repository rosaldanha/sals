import type { Device, Entity } from '$lib/hassinterfaces';

class Panel {
    public devices: Device[];

    constructor() {
       this.devices = [];
    }
    private static getEmptyDevice(): Device {
        return {
            device_name: '',
            device_area: '',
            device_config: '',
            device_id: '',
            device_entities:[]
        }
    }
    public static getEmptyPanel() : Panel {
        const retValue = new Panel();
        for (let index = 0; index < 6; index++) {            
            retValue.devices.push( Panel.getEmptyDevice() );    
        }
        return retValue;
    }

    /**
     * loadConfig
     */
    public loadConfig(deviceName:string) {
        
    }

}