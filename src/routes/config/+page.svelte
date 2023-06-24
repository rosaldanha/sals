<script lang='ts'>
    import { BUTTONSTATE, type Device, type Entity, type PanelButton } from '$lib/hassinterfaces';
    //TODO: dar a opção de login manual no home assistant para segurança getauth();
    //TODO: implementar .env para escolher entre auth manual x token
    import { HomeAssistantSocket } from '$lib/hasswebsockets';
    import ButtonPanel from '$lib/components/ButtonPanel.svelte';
    import { Button, SimpleGrid, Space } from '@svelteuidev/core';
    import CogOutline from 'svelte-material-icons/CogOutline.svelte';

    export let data: any;
    const buttonQuantity: number = 6;
    let panelButtons: {[buttonId:string] : PanelButton } = {};
    const socket =  new HomeAssistantSocket(data.homeAssistantUrl,data.accessToken);
  
    
    function getEntitiesToWatch(){
        const entities: string[] = [];
        for (const device of data.devices) {
            const entity =  device.device_entities.find((element:Entity) => {
                return element.entity_id.startsWith('binary_sensor.');
            } );            
            if (entity){
                entities.push(entity.entity_id);            
            }            
        }
        return entities;
    }

    function getDeviceFromEntity(entityId:string):Device|null {
        for (const device of data.devices) {
            const entity = device.device_entities.find((element:Entity) => {
                return element.entity_id === entityId;
            } );
            if (entity){
                return device;
            }
        }
        return null;
    }
    
    function initializePanelButtons(){
        for (let index = 1; index < buttonQuantity+1; index++) {                        
            panelButtons[`button-${index}`] = {
                device: null,
                panelArea: '',
                panelName: '',
                buttonPos: index,
                buttonState: BUTTONSTATE.AVAILABLE,
            };
        }
    }
    
    function handleSearch(result:any, listener: any ){        
        const device = getDeviceFromEntity(result.variables.trigger.entity_id);        
        Object.keys(panelButtons).forEach(chave => {
            if (panelButtons[chave].buttonState == BUTTONSTATE.SEARCHING) {
                panelButtons[chave].device = device;                
                panelButtons[chave].buttonState = BUTTONSTATE.REGISTERED;                
            }
        });        
        enableHtmlButtons();
        socket.socket.removeEventListener('message',listener);    
    }

    function handleButton(e:any){
        const selectedButton = panelButtons[e.target.id];
        switch (selectedButton.buttonState) {
            case BUTTONSTATE.AVAILABLE:
                //start searching                
                disableHtmlButtons();                
                selectedButton.buttonState = BUTTONSTATE.SEARCHING;
                panelButtons = panelButtons;                                
                socket.subscribeToStateTrigger( getEntitiesToWatch(), 
                        handleSearch);                
                break;
            case BUTTONSTATE.SEARCHING:
                
                // do nothing this must be disabled
                break;
            case BUTTONSTATE.REGISTERED:
                // run configure
                break;
        
            default:
                break;
        }                        
    }

    function disableHtmlButtons(){
        for (let index = 1; index < buttonQuantity+1; index++){
            const button = document.getElementById(`button-${index}`);
            button!.setAttribute('disabled','true');
        }
    }

    function enableHtmlButtons(){
        for (let index = 1; index < buttonQuantity+1; index++){
            const button = document.getElementById(`button-${index}`);
            button!.removeAttribute('disabled');
        } 
    }
    initializePanelButtons();
</script>

<h1>The websocket thing</h1>
<SimpleGrid 
    breakpoints={[
        { maxWidth: 100, cols: 1, spacing: 'sm' },
        { maxWidth: 50, cols: 1, spacing: 'sm' },
        { maxWidth: 100, cols: 1, spacing: 'sm' }
    ]}
    cols={3}>
    <div>
        <ButtonPanel panelButton={panelButtons["button-1"]} buttonId={'button-1'} handleButton={handleButton} ></ButtonPanel> 
    </div>
    <div >
            a 
    </div>
    <div>
        <ButtonPanel panelButton={panelButtons["button-4"]} buttonId={'button-4'} handleButton={handleButton} ></ButtonPanel> 
    </div>
    <div>
        <ButtonPanel panelButton={panelButtons["button-2"]} buttonId={'button-2'} handleButton={handleButton} ></ButtonPanel> 
    </div>
    <div  color='green'>
        a 
    </div>
    <div>
        <ButtonPanel panelButton={panelButtons["button-5"]} buttonId={'button-5'} handleButton={handleButton} ></ButtonPanel> 
    </div>
    <div>
        <ButtonPanel panelButton={panelButtons["button-3"]} buttonId={'button-3'} handleButton={handleButton} ></ButtonPanel> 
    </div>  
    <div  color='green'>
        a 
    </div>      
    <div>
        <ButtonPanel panelButton={panelButtons["button-6"]} buttonId={'button-6'} handleButton={handleButton} ></ButtonPanel> 
    </div>    
</SimpleGrid>
