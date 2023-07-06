import { panels, type PanelUpdate } from "./stores/panelsupdater";
export class EspHomeWebSocket {    
    private socket: WebSocket;
    private esphomeUrl: string = 'wss://esphome.sal.net.br/run';
    private currentPanel: number = 0;
    private panelList: PanelUpdate[];
    private unsubPanelListUpdates: any;
    constructor(){
        this.panelList = [];
        this.unsubPanelListUpdates = panels.subscribe((transferPanel) => this.panelList = transferPanel);
        this.socket = new WebSocket(this.esphomeUrl);        
        this.socket.onmessage = this.handleMessages;
        this.socket.onopen = (event) =>{
            this.sendCurrentPanelOTA();
        }
    }
    private sendCurrentPanelOTA(){
        if (this.currentPanel < this.panelList.length) {
            this.socket.send(
                JSON.stringify({
                    type: "spawn",
                    configuration: this.panelList[this.currentPanel].deviceName,
                    port: "OTA"               
                })
            );
            this.currentPanel += 1;
        }
        else
        {
            this.unsubPanelListUpdates();
            this.socket.close();
        }
    }
    private handleMessages(event:any){
        //event data contains:
        // {"type": "percent", "device": "smr2010", "status": "100"}
        //{"type": "compile", "device": "smr2010", "status": "done"}
    }

}

