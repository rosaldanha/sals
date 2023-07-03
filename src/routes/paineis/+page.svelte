
<script lang="ts">
    import type {  Device,  Panel } from '$lib/hassinterfaces.js';
    import { writable, type Writable } from 'svelte/store';
    import PanelEditor from '$lib/components/PanelEditor.svelte';

    export let data: any;
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
