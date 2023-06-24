<script lang='ts'>
    import { BUTTONSTATE, type PanelButton } from '$lib/hassinterfaces';
    import { Button, SimpleGrid, Space } from '@svelteuidev/core';
    
    export let panelButton: PanelButton;
    export let buttonId: string;
    export let handleButton: any;

    let buttonColors: {[colorId:string] : string } = {
        [BUTTONSTATE.AVAILABLE]: "green",
        [BUTTONSTATE.SEARCHING]: "yellow",
        [BUTTONSTATE.REGISTERED]: "blue"
    };
</script>

<Button 
    loading={panelButton.buttonState === BUTTONSTATE.SEARCHING}
    fullSize            
    color={buttonColors[panelButton.buttonState]} 
    on:click={handleButton} 
    id={buttonId}
    radius="md">
    {panelButton.buttonPos} {panelButton.device ? ' - ' + panelButton.device?.device_name : '' }
</Button> 
{#if panelButton.buttonState === BUTTONSTATE.REGISTERED }
    <Space h={10}></Space>
    <Button
        fullSize            
        color={buttonColors[panelButton.buttonState]} 
        radius="md">
        Configure
    </Button>
{/if}