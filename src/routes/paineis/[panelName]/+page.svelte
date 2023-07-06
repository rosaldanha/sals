
<script lang="ts">
    import PanelEditor from '$lib/components/PanelEditor.svelte';

    export let data: any;
</script>


    <PanelEditor 
        panel={data.panel}  
        homeAssistantUrl={data.homeAssistantUrl}
        accessToken={data.accessToken}
        entities={data.entities} 
        esphomeEntitiesToWatch={data.esphomeEntitiesToWatch}
        esphomeServer={data.esphomeServer}>        
    </PanelEditor>

