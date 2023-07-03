<script lang='ts'>
import { Container, Card, Grid, Center, Space } from '@svelteuidev/core';
import DeviceView from './DeviceView.svelte';
import DeviceEntitiesEditor from './DeviceEntitiesEditor.svelte';
import type {  Device,  Panel } from '$lib/hassinterfaces.js';
import  { writable, type Writable } from 'svelte/store';

export let panel: Panel;
export let entities: string[] = [];
export let esphomeServer: string;
export let esphomeEntitiesToWatch: string[];
export let accessToken: string;
export let homeAssistantUrl: string;



let currentStoreDevice: Writable<Device>;
let disabled: boolean| undefined = undefined;
const sizes = {
        xs: 440,
        sm: 720,
        md: 960,
        lg: 1140,
        xl: 1320,
    };
const buttonPosition = [
    {l:0,r:3},
    {l:1,r:4},
    {l:2,r:5}
] 

function getEmptyDevice():Device{
    return {
        device_id: '',
        device_name: '',
        device_area: '',
        device_entities: []
    }
}

function setupFunc(e:any){
    currentStoreDevice.set(panel.devices[e.detail.index]);
}
currentStoreDevice = writable(panel.devices[0]);
function preparePanel(){    
    for (let i=panel.devices.length; i <=5; i++){
        panel.devices.push(getEmptyDevice());
    }
}
function configureButtonForSearch(e:any) {
        disabled = e.detail.isSearching;
        //on:deviceIsSearching={configureButtonForSearch}
}
preparePanel();
</script>


<Container {sizes}  size='sm'   >
    <Card shadow='lg' padding='xs' radius='sm' withBorder style='z-index: inherit; overflow:visible;' >
        <Grid spacing="xs" grow={false}>
            <Grid.Col span={5} >                 
                <Center>
                    <h2>Panel: {panel.panel_name} </h2>  
                </Center>
                <Grid>
                    {#each buttonPosition as pos, idx}
                        <Grid.Col span={6}>                            
                            <DeviceView 
                                on:deviceIsSearching={configureButtonForSearch}
                                {disabled}
                                panel={panel}
                                accessToken={accessToken}
                                homeAssistantUrl={homeAssistantUrl}
                                esphomeEntitiesToWatch={esphomeEntitiesToWatch} 
                                device={panel.devices[pos.l]} 
                                index={pos.l} 
                                on:deviceViewSettingsClickEvent={setupFunc} />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <DeviceView 
                                on:deviceIsSearching={configureButtonForSearch}
                                {disabled}                          
                                panel={panel}
                                accessToken={accessToken}
                                homeAssistantUrl={homeAssistantUrl}                            
                                esphomeEntitiesToWatch={esphomeEntitiesToWatch} 
                                device={panel.devices[pos.r]} 
                                index={pos.r} 
                                on:deviceViewSettingsClickEvent={setupFunc} />
                        </Grid.Col>
                    {/each}                    
                </Grid>
            </Grid.Col>
            <Grid.Col span={7} >
                <DeviceEntitiesEditor esphomeServer={esphomeServer} entitiesIds={entities} deviceStore={currentStoreDevice} />                           
            </Grid.Col>
        </Grid>
    </Card>
</Container>
<Space h='md'/>