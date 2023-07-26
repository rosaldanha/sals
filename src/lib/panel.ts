import  { Device, emptyDeviceInterface,  } from '$lib/device';
import type {DeviceInterface} from '$lib/device';

export interface PanelInterface {
    panel_name: string;
    panel_area: string;
    devices: Device[]|DeviceInterface[];
}

export function emptyPanelInterface(panelName:string):PanelInterface {
    return {
        panel_name: panelName,
        panel_area: '',
        devices: [
            emptyDeviceInterface(),
            emptyDeviceInterface(),
            emptyDeviceInterface(),
            emptyDeviceInterface(),
            emptyDeviceInterface(),
            emptyDeviceInterface()
        ]
    }
}


export class Panel implements PanelInterface {
    public panel_name: string;
    public panel_area: string;
    public devices: Device[] = [];
    constructor(panel:PanelInterface){
        this.panel_name = panel.panel_name;
        this.panel_area = panel.panel_area;
        panel.devices.forEach((deviceInt) =>{
            this.devices.push(new Device(deviceInt));
        });
    }

    public static getEmptyPanel(name:string, panel_area:string ='') : Panel {
        const emptyPanel = new Panel({panel_name: name,  panel_area: panel_area , devices: []});
        for (let index = 0; index < 6; index++) {            
            emptyPanel.devices.push( Device.emptyDevice() );    
        }
        return emptyPanel;
    }
}