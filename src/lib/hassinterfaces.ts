export interface Device {
    device_id: string;
    device_name: string;
    device_area: string;
    device_entities: Entity[];
}
export interface Entity {
    entity_id: string;
    state: string;
    attributes: {
      [key: string]: any;
    };
    last_changed: string;
    last_updated: string;
    // outras propriedades adicionais, se necessário
}
export interface Panel {
    devices: Device[];
    panel_name: string;
    panel_area: string;
}
export enum BUTTONSTATE {
    AVAILABLE = "available",
    SEARCHING = "searching",
    REGISTERED = "registered"
}

export interface PanelButton {
    device: Device | null;
    panelName: string;
    panelArea: string;
    buttonId:  string ;
    buttonState: BUTTONSTATE;
}
export const deviceCapabilities = {
     light: 'LIGHT',
    switch: 'SWITCH',
    offline: 'OFFLINE'
}

export const deviceViewSettingsClickEvent = 'deviceViewSettingsClickEvent';