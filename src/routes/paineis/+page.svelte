
<script lang="ts">
    import PanelEditor from '$lib/components/PanelEditor.svelte';
    import {Panel, type PanelInterface} from '$lib/panel';
    
    import { logF } from '$lib/logger';
    export let data: {
        panelsInterfaces: PanelInterface[],
        entitiesIdToChoose: string[],
        esphomeEntitiesToWatch: string[],
        esphomeServer: string,
        homeAssistantUrl: string,
        accessToken: string };
    //logF('Start route',data.panels);
   
    let panels: Panel[] = [];
    data.panelsInterfaces.forEach((panelsInterface)=>{
        panels.push(new Panel(panelsInterface));
    });
</script>


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
