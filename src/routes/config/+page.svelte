<script lang='ts'>
    import { BUTTONSTATE, type Device, type Entity, type PanelButton } from '$lib/hassinterfaces';
    //TODO: dar a opção de login manual no home assistant para segurança getauth();
    //TODO: implementar .env para escolher entre auth manual x token
    import { HomeAssistantSocket } from '$lib/hasswebsockets';
    import { Button, SimpleGrid, Space } from '@svelteuidev/core';
    import CogOutline from 'svelte-material-icons/CogOutline.svelte';

    export let data: any;
    const buttonQuantity: number = 6;
    let panelButtons: {[buttonId:string] : PanelButton } = {};
    const socket =  new HomeAssistantSocket(data.homeAssistantUrl,data.accessToken);
    let buttonColors: {[colorId:string] : string } = {
        [BUTTONSTATE.AVAILABLE]: "green",
        [BUTTONSTATE.SEARCHING]: "yellow",
        [BUTTONSTATE.REGISTERED]: "blue"
    };
    
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

    
    function sub(){
        socket.subscribeToStateTrigger( getEntitiesToWatch(), 
            (e) =>{console.log(getDeviceFromEntity(e.variables.trigger.entity_id),
                'from callback')});
    }
    
    
    function initializePanelButtons(){
        for (let index = 1; index < buttonQuantity+1; index++) {                        
            panelButtons[`button-${index}`] = {
                device: null,
                panelArea: '',
                panelName: '',
                buttonId: '',
                buttonState: BUTTONSTATE.AVAILABLE,
            };
        }
    }
    initializePanelButtons();
    function handleSearch(result:any, listener: any ){
        console.log(result, 'no callback');
        const device = getDeviceFromEntity(result.variables.trigger.entity_id);
        
        Object.keys(panelButtons).forEach(chave => {
            if (panelButtons[chave].buttonState == BUTTONSTATE.SEARCHING) {
                panelButtons[chave].device = device;
                panelButtons[chave].buttonState = BUTTONSTATE.REGISTERED;                
            }
        });
        //TODO: search for BUTTONSTATE.searching and change state to BUTTONSTATE.registered
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
                buttonColors = buttonColors;                
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
        

        console.log(selectedButton);
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

</script>

<h1>The websocket thing</h1>
<SimpleGrid cols={2}>
    <div>
        <Button 
            loading={panelButtons["button-1"].buttonState === BUTTONSTATE.SEARCHING}
            fullSize            
            color={buttonColors[panelButtons["button-1"].buttonState]} 
            on:click={handleButton} 
            id="button-1" 
            radius="md">
            1 {panelButtons["button-1"].device ? ' - ' + panelButtons["button-1"].device?.device_name : '' }
        </Button> 
        {#if panelButtons["button-1"].buttonState === BUTTONSTATE.REGISTERED }
            <Space h={10}></Space>
            <Button
                fullSize            
                color={buttonColors[panelButtons["button-1"].buttonState]} 
                radius="md">
                Configure
            </Button>
        {/if}
    </div>
    <div>
        <Button 
            loading={panelButtons["button-4"].buttonState === BUTTONSTATE.SEARCHING}
            fullSize
            color={buttonColors[panelButtons["button-4"].buttonState]} 
            on:click={handleButton} 
            id="button-4" 
            radius="md">
            4 {panelButtons["button-4"].device ? ' - ' + panelButtons["button-4"].device?.device_name : '' }
        </Button>    
        {#if panelButtons["button-4"].buttonState === BUTTONSTATE.REGISTERED }
            <Space h={10}></Space>
            <Button
                fullSize            
                color={buttonColors[panelButtons["button-4"].buttonState]} 
                radius="md">
                Configure
            </Button>
        {/if}        
    </div>
    <div>
        <Button 
            loading={panelButtons["button-2"].buttonState === BUTTONSTATE.SEARCHING}
            fullSize
            color={buttonColors[panelButtons["button-2"].buttonState]} 
            on:click={handleButton} 
            id="button-2" 
            radius="md">
            2 {panelButtons["button-2"].device ? ' - ' + panelButtons["button-2"].device?.device_name : '' }
        </Button>
        {#if panelButtons["button-2"].buttonState === BUTTONSTATE.REGISTERED }
            <Space h={10}></Space>
            <Button
                fullSize            
                color={buttonColors[panelButtons["button-2"].buttonState]} 
                radius="md">
                Configure
            </Button>
        {/if}        
    </div>
    <div>
        <Button 
            loading={panelButtons["button-5"].buttonState === BUTTONSTATE.SEARCHING}
            fullSize
            color={buttonColors[panelButtons["button-5"].buttonState]} 
            on:click={handleButton} 
            id="button-5" 
            radius="md">
            5 {panelButtons["button-5"].device ? ' - ' + panelButtons["button-5"].device?.device_name : '' }
        </Button>
        {#if panelButtons["button-5"].buttonState === BUTTONSTATE.REGISTERED }
            <Space h={10}></Space>
            <Button
                fullSize            
                color={buttonColors[panelButtons["button-5"].buttonState]} 
                radius="md">
                Configure
            </Button>
        {/if}        
    </div>
    <div>
        <Button 
            loading={panelButtons["button-3"].buttonState === BUTTONSTATE.SEARCHING}
            fullSize
            color={buttonColors[panelButtons["button-3"].buttonState]} 
            on:click={handleButton} 
            id="button-3" 
            radius="md">
            3 {panelButtons["button-3"].device ? ' - ' + panelButtons["button-3"].device?.device_name : '' }
        </Button>
        {#if panelButtons["button-3"].buttonState === BUTTONSTATE.REGISTERED }
            <Space h={10}></Space>
            <Button
                fullSize            
                color={buttonColors[panelButtons["button-3"].buttonState]} 
                radius="md">
                Configure
            </Button>
        {/if}        
    </div>
    <div>
        <Button 
            loading={panelButtons["button-6"].buttonState === BUTTONSTATE.SEARCHING}
            fullSize            
            color={buttonColors[panelButtons["button-6"].buttonState]} 
            on:click={handleButton} 
            id="button-6" 
            radius="md">
            6 
        </Button>
        {#if panelButtons["button-6"].buttonState === BUTTONSTATE.REGISTERED }
            <Space h={10}></Space>
            <Button
                fullSize            
                color={buttonColors[panelButtons["button-6"].buttonState]} 
                radius="md">
                Configure
            </Button>
        {/if}         
    </div>    
</SimpleGrid>
<Space  h={30}></Space>

<Button on:click={sub}>get</Button>