
<script lang="ts">
    import DeviceEntitiesEditor from '$lib/components/DeviceEntitiesEditor.svelte';
    import DeviceView from '$lib/components/DeviceView.svelte';
    import type {  Device,  Panel } from '$lib/hassinterfaces.js';
    import {  Card, Center, Container, Grid, Group, Space } from '@svelteuidev/core';
    import { writable, type Writable } from 'svelte/store';
    

    export let data: any;
    let entities: any[] = [];
    for (const entity of data.entities){
        entities.push({
            label: entity,
            value: entity
        });
    }
    
    let currentStoreDevices: Writable<Device>[] = [];
    function loadCurrentDevices(){
        data.panels.forEach( (panel: Panel) => {
            currentStoreDevices.push(writable(panel.devices[0]));
        });
    }
    loadCurrentDevices();
    function setupFunc(e:any){        
        currentStoreDevices[e.detail.index].set(e.detail.device);
    }
</script>


{#each data.panels as panel, index (panel.panel_name)  }
<Container size='lg'   >
<Card shadow='lg' padding='xs' radius='xl' withBorder style='z-index: inherit; overflow:visible;' >
    <Group spacing='xs' direction='row'>
        <div>
            <h1>{panel.panel_name} </h1>  
            {#each panel.devices as device, idx}
                <DeviceView {device} {index} on:deviceViewSettingsClickEvent={setupFunc} />
            {/each}            
        </div>
        <div>
            <DeviceEntitiesEditor entitiesIds={data.entities} deviceStore={currentStoreDevices[index]} />                           
        </div>
    </Group>
</Card>
</Container>
<Space h='md'/>
{/each}
