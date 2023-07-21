import { panels, type PanelUpdate } from "./stores/panelsupdater";

export interface wsocketData {
    //{"type": "percent", "device": "smr2010", "status": "100"}
    type: string;
    device: string;
    status: string;
}
export type RedirectCallBack = (event: wsocketData) => void;
export type LocalCallBack = (newDeviceName: string) => void;

export class EspHomeWebSocket {    

    private socket: WebSocket;
    private esphomeUrl: string = 'ws://localhost:8001';
    private currentDevice: number = 0;
    private deviceList: PanelUpdate[];
    private unsubDeviceListUpdates: any;
    private onConfig: RedirectCallBack;
    private onOta: RedirectCallBack;
    private onPercent: RedirectCallBack;
    private onCompile: RedirectCallBack;
    private onChangeDevice: (newDeviceName: string) => void;

    constructor(onConfig: RedirectCallBack,
            onCompile: RedirectCallBack,
            onPercent: RedirectCallBack,
            onOta: RedirectCallBack,
            onChangeDevice: LocalCallBack) {
        this.deviceList = [];
        this.unsubDeviceListUpdates = panels.subscribe((transferPanel) => this.deviceList = transferPanel);                
        this.onCompile = onCompile;
        this.onConfig  = onConfig;
        this.onPercent = onPercent;
        this.onOta     = onOta;
        this.onChangeDevice = onChangeDevice;
        this.socket = new WebSocket(this.esphomeUrl);
        this.socket.onmessage = this.handleMessages;    
        this.socket.onopen = (event) =>{
            this.sendCurrentDeviceOta();
        }
    }
    private sendCurrentDeviceOta(){
        if (this.currentDevice < this.deviceList.length) {
            this.onChangeDevice(this.deviceList[this.currentDevice].deviceName);
            this.socket.send(
                JSON.stringify({
                    type: "spawn",
                    configuration: `${this.deviceList[this.currentDevice].deviceName}.yaml`,
                    port: "OTA"               
                })
            );
            this.currentDevice += 1;
        }
        else
        {
            //TODO:create envent on finish update or var finished
            this.unsubDeviceListUpdates();
            this.socket.close();
        }
    }
    private handleMessages = (event:MessageEvent) => {
        const evtData: wsocketData = JSON.parse(event.data);
        switch (evtData.type) {
            case "percent":
                this.onPercent(evtData);
                break;
            case "compile":
                this.onCompile(evtData);
                break;        
            case "ota":
                this.onOta(evtData);
                if (evtData.status === 'done'){
                    this.sendCurrentDeviceOta();
                }
                break;    
            case "config":
                //console.log(evtData);
                this.onConfig(evtData);
                break; 
            default:
                break;
        }
    }

}
export async function sendConfig( esphomeServer:string, deviceName: string, config: string ) {
    const url = `${esphomeServer}/edit?configuration=${deviceName}.yaml`;
    const response = await fetch(url, {
            method: "POST", 
            mode: "no-cors",
            cache: "no-cache",                
            headers: {
            "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer", 
            body: config, 
        });    
    //console.log(response);
}
