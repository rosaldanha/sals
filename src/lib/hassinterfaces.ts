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

// export interface DeviceEntity extends Device {
//     device_entities: Entity[];
// }
export const deviceCapabilities = {
     light: 'LIGHT',
    switch: 'SWITCH',
    offline: 'OFFLINE'
}

export const deviceViewSettingsClickEvent = 'deviceViewSettingsClickEvent';