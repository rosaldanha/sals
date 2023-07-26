
<script lang="ts">
    import PanelEditor from '$lib/components/PanelEditor.svelte';
    import {Panel, type PanelInterface} from '$lib/panel';    
    import { logF } from '$lib/logger';  
    import { Button, Modal, Space } from '@svelteuidev/core';
    
    function getLastThreeCharsAsNumber(inputString: string): number {
     
        if (inputString.length < 3) {
            throw new Error("Input string must have at least 3 characters.");
        }       
        const lastThreeChars = inputString.substring(inputString.length - 3); 
        const result = parseInt(lastThreeChars, 10); 
        return result;
    }
    export let data: {
        panelsInterfaces: PanelInterface[],
        entitiesIdToChoose: string[],
        esphomeEntitiesToWatch: string[],
        esphomeServer: string,
        homeAssistantUrl: string,
        accessToken: string };
    //logF('Start route',data.panels);
   
    let panels: Panel[] = [];
    let higherPanel: number = 0;
    data.panelsInterfaces.forEach((panelsInterface)=>{
        if (getLastThreeCharsAsNumber(panelsInterface.panel_name) > higherPanel) {
            higherPanel = getLastThreeCharsAsNumber(panelsInterface.panel_name);
        }
        panels.push(new Panel(panelsInterface));
    });
    const newPanelUrl: string = `/paineis/pnl${(higherPanel + 1).toString().padStart(3, '0')}`;
</script>

<Button color={'dark'} fullSize href={newPanelUrl} > New Panel </Button>
{#each panels as panel, index (panel.panel_name)  }    
    <PanelEditor 
        {panel}  
        homeAssistantUrl={data.homeAssistantUrl}
        accessToken={data.accessToken}
        entities={data.entitiesIdToChoose} 
        esphomeEntitiesToWatch={data.esphomeEntitiesToWatch}
        esphomeServer={data.esphomeServer}>        
    </PanelEditor>
{/each}

