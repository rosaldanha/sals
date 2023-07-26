import { log } from "$lib/logger";
import { to_number } from "svelte/internal";
import { type RedirectCallBack, type wsocketData, EspHomeWebSocket } from "./esphomewebsockets";
import { STATUS } from "./stores/panelsupdater";
import { panels } from '$lib/stores/panelsupdater';
import { get } from 'svelte/store';

let currentDevice: string = '';

function setStatus(statusType:string,curStatus:string){
    const foundDevice = get(panels).find((curDevice)=>{ 
        return curDevice.deviceName === currentDevice });
    log('-1 status', statusType, curStatus, currentDevice)
    if (foundDevice) {
        log('0status', statusType, curStatus)
        if (curStatus === STATUS.RUNNING.toString()) {
            log('1status', statusType, curStatus)
            switch (statusType) {
                case 'config':
                    log('2status', statusType, curStatus)
                    foundDevice.configStatus = STATUS.RUNNING;
                    break;
                case 'compile':
                    foundDevice.compileStatus = STATUS.RUNNING;
                    break;
                case 'ota':
                    foundDevice.uploadStatus = STATUS.RUNNING;
                    break;                
                default:
                    break;
            }                
        }
        else
        {
            switch (statusType) {
                case 'config':
                    foundDevice.configStatus = STATUS.DONE;
                    break;
                case 'compile':
                    foundDevice.compileStatus = STATUS.DONE;
                    break;
                case 'ota':
                    foundDevice.uploadStatus = STATUS.DONE;
                    break;                
                default:
                    break;
            } 
        }            
    }  
}
const onConfig: RedirectCallBack = (evt:wsocketData) => {    
    setStatus(evt.type,evt.status);
    panels.set(get(panels));
};
const onCompile: RedirectCallBack = (evt:wsocketData) => {   
    setStatus(evt.type,evt.status);
    panels.set(get(panels));    
};
const onPercent: RedirectCallBack =  (evt:wsocketData) => {    
    const foundDevice = get(panels).find((curDevice)=>{ return curDevice.deviceName === currentDevice });
    if (foundDevice) {
        foundDevice.uploadPercent = to_number(evt.status);
    }          
    panels.set(get(panels));
};
const onOta: RedirectCallBack = (evt:wsocketData) => {    
    setStatus(evt.type,evt.status);    
    panels.set(get(panels));
};



export function uploadFirmware(firstDevice:string){
    currentDevice = firstDevice;
    const espHomeWebSockets:EspHomeWebSocket =  
                new EspHomeWebSocket(
                onConfig,
                onCompile,
                onPercent,
                onOta,
                onChangeDevice);        
}

function onChangeDevice(newDeviceName: string): void {
    console.log(newDeviceName);
    currentDevice =  newDeviceName;
}
