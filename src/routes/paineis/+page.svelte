
<script lang="ts">
    import PanelEditor from '$lib/components/PanelEditor.svelte';
    import { logF } from '$lib/logger';
    export let data: any;
    logF('Start route',data.panels);
</script>


{#each data.panels as panel, index (panel.panel_name)  }
    
    <PanelEditor 
        {panel}  
        homeAssistantUrl={data.homeAssistantUrl}
        accessToken={data.accessToken}
        entities={data.entities} 
        esphomeEntitiesToWatch={data.esphomeEntitiesToWatch}
        esphomeServer={data.esphomeServer}>        
    </PanelEditor>
{/each}
