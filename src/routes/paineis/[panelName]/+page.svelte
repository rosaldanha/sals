
<script lang="ts">
    import PanelEditor from '$lib/components/PanelEditor.svelte';
    import {Panel, type PanelInterface} from '$lib/panel';

   // export let data: any;


    export let data: {
        panelInterface: PanelInterface,
        entitiesIdToChoose: string[],
        esphomeEntitiesToWatch: string[],
        esphomeServer: string,
        homeAssistantUrl: string,
        accessToken: string };
    const panel: Panel = new Panel(data.panelInterface);


</script>


    <PanelEditor 
        panel={panel}   
        homeAssistantUrl={data.homeAssistantUrl}
        accessToken={data.accessToken}
        entities={data.entitiesIdToChoose} 
        esphomeEntitiesToWatch={data.esphomeEntitiesToWatch}
        esphomeServer={data.esphomeServer}>        
    </PanelEditor>

