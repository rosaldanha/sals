<script lang='ts'>
    import { BUTTONSTATE, type PanelButton } from '$lib/hassinterfaces';
    import { Button, Modal, Space } from '@svelteuidev/core';
    import { writable, type Writable } from 'svelte/store';
    import DeviceEntitiesEditor from '$lib/components/DeviceEntitiesEditor.svelte';
    import type { Device } from '$lib/hassinterfaces';
    
    export let panelButton: PanelButton;
    export let buttonId: string;
    export let handleButton: any;
    export let esphomeServer: string;
    export let entitiesIds: string[];

    let opened = false;
    let buttonColors: {[colorId:string] : string } = {
        [BUTTONSTATE.AVAILABLE]: "green",
        [BUTTONSTATE.SEARCHING]: "yellow",
        [BUTTONSTATE.REGISTERED]: "blue"
    };
    
    let deviceStore:Writable<Device>;

    function clickConfig(){
        deviceStore = writable(panelButton.device);
        opened = true;
    }
    
    function closeModal(){
        opened = false;
    }    
</script>

<Button 
    loading={panelButton.buttonState === BUTTONSTATE.SEARCHING}
    fullSize            
    color={buttonColors[panelButton.buttonState]} 
    on:click={handleButton} 
    id={buttonId}
    radius="md">
    {panelButton.buttonPos} {panelButton.device.device_id !== '' ? ' - ' + panelButton.device?.device_name : '' }
</Button> 
{#if panelButton.buttonState === BUTTONSTATE.REGISTERED }
    <Space h={10}></Space>
    <Button
        id={buttonId}
        fullSize     
        on:click={clickConfig}       
        color={buttonColors[panelButton.buttonState]} 
        radius="md">
        Configure
    </Button>
{/if}

<Modal 
    overlayOpacity={0.55} 
    overlayBlur={3} 
    size="400px" 
    {opened} 
    target={'body'} 
    on:close={closeModal} 
    title={`Device: ${panelButton.device.device_name}`}>
	<DeviceEntitiesEditor esphomeServer={esphomeServer} deviceStore={deviceStore}  entitiesIds={entitiesIds} ></DeviceEntitiesEditor>
</Modal>