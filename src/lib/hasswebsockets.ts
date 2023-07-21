export class HomeAssistantSocket {
    
    readonly deviceMessageId: number     = 5;
    readonly areaMessageId:number        = 4;
    readonly subscribeToMessageId:number = 7;
    isAuthOk :boolean = false;
    private homeassistantUrl :string = '';
    private homeassistantToken :string = '';
    public socket: WebSocket;

    constructor(homeassistantUrl:string, homeassistantToken :string ){
        this.homeassistantUrl = homeassistantUrl;
        this.homeassistantToken = homeassistantToken;
        this.socket = this.getConnection(); 
    }


    private getConnection():WebSocket {
        const tmpHomeAssistantUrl = new URL(this.homeassistantUrl);
        const websocketProtocol = 
            `${tmpHomeAssistantUrl.protocol === 'https:' ? 'wss://' : 'ws://'}`;
        const websocketUrl = `
            ${websocketProtocol}${tmpHomeAssistantUrl.hostname}/api/websocket`;    
        const socket = new WebSocket(websocketUrl);
        
        socket.onmessage = (event) =>{            
            const message = JSON.parse(event.data);
            if (message.type === "auth_ok"){
               this.isAuthOk = true;
            }            
        }    
        socket.onopen = (event) =>{
            socket.send(
                JSON.stringify({
                    type: 'auth',
                    access_token: this.homeassistantToken,
                })
            );
        }        
        return socket;
    }
    
    getAreas(){
        this.socket.send(JSON.stringify({ type: 'config/area_registry/list', id: this.areaMessageId }));
    }
    
    getDevices(){
        this.socket.send(JSON.stringify({ type: 'config/device_registry/list', id: this.deviceMessageId }));
    }
    
    public subscribeToStateTrigger(entities: string[],callback:  ( event: any, listener: any) => any){
        
        const subscribeYaml = `
            {
                "id": ${this.subscribeToMessageId},
                "type": "subscribe_trigger",
                "trigger": {
                    "platform": "state",
                    "entity_id": "${entities.join(',')}",
                    "from": "off",
                    "to":"on"
                }
            }`;
        const listener = (messageEvent:any) => {
            const event = JSON.parse(messageEvent.data);
            if (event.id == this.subscribeToMessageId && event.type !== 'result'){            
                callback(event.event,listener);
            }
            if (event.id == this.subscribeToMessageId && event.type === 'result'){
                if (!event.success){
                    //TODO: ADD THROW ERROR !
                }
            }
        };
        this.socket.readyState 
       this.socket.addEventListener('message',listener);        
       this.socket.send(subscribeYaml);
    }
    






}



