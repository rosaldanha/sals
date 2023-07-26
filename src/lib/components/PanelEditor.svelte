<script lang='ts'>
import { Container, Card, Grid, Center, Space, Button, TextInput } from '@svelteuidev/core';
import DeviceView from './DeviceView.svelte';
import DeviceEntitiesEditor from './DeviceEntitiesEditor.svelte';

// import type {  Device,  Panel } from '$lib/hassinterfaces.js';
// import { getEmptyDevice } from '$lib/hassinterfaces';

import type {Panel} from '$lib/panel';
import {Device} from '$lib/device';

import  { writable, type Writable } from 'svelte/store';
import PanelUpdater from './PanelUpdater.svelte';
import {panels, STATUS, type PanelUpdate} from '$lib/stores/panelsupdater';
import {uploadFirmware} from '$lib/panelupdater.client';
import {sendConfig} from '$lib/esphomewebsockets';

export let panel: Panel;
export let entities: string[] = [];
export let esphomeServer: string;
export let esphomeEntitiesToWatch: string[];
export let accessToken: string;
export let homeAssistantUrl: string;

let devicesNamesToUpdate: string[];
let showPanelUpdater: boolean = false;
let currentStoreDevice: Writable<Device>;
let disabled: boolean| undefined = undefined;

let selectedButtonPos:number = 0;
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
const deviceArea: Writable<string> = writable('');
const devicePanelName: Writable<string> = writable('');


function setupFunc(e:any){    
    currentStoreDevice.set(panel.devices[e.detail.index]);    
    selectedButtonPos = e.detail.index;
}

function preparePanel(){    
    for (let i=panel.devices.length; i <=5; i++){
        panel.devices.push(Device.emptyDevice());
    }
}
function configureButtonForSearch(e:any) {
        disabled = e.detail.isSearching;
        //on:deviceIsSearching={configureButtonForSearch}
}
function onDeviceUpdated(e:any) {    
    $currentStoreDevice.buttonPos = -1;
    $currentStoreDevice.panelName = '';
    $currentStoreDevice = $currentStoreDevice;    
    showPanelUpdater = true;
    sendConfig(esphomeServer,$currentStoreDevice.device_name,$currentStoreDevice.device_config);
    devicesNamesToUpdate = [];
    panels.set([getPanelToUpdate($currentStoreDevice.device_name)]);
    devicesNamesToUpdate.push($currentStoreDevice.device_name);             
    uploadFirmware(devicesNamesToUpdate[0]);    
    //sendconfig here and compile run pudater
    currentStoreDevice.set(e.detail.device);
    panel.devices[selectedButtonPos] = e.detail.device;
}

function getPanelToUpdate(deviceName:string){
   const panelToUpdate:PanelUpdate = {
    deviceName: deviceName,
    configStatus: STATUS.STOPED,
    compileStatus: STATUS.STOPED,
    uploadStatus: STATUS.STOPED,
    uploadPercent: 0
    };
    return panelToUpdate;
}
async function runUpdater(e:any){
    const panelsToUpdate: PanelUpdate[] = [];
    devicesNamesToUpdate = [];
    panel.devices.forEach((device)=>{
        if (device.device_name !== ''){
            panelsToUpdate.push(getPanelToUpdate(device.device_name));
            devicesNamesToUpdate.push(device.device_name);
        }
    });
   // console.log(devicesNamesToUpdate);
    panels.set(panelsToUpdate);
    showPanelUpdater = true;    
    if (devicesNamesToUpdate.length > 0){
        panel.devices.forEach((device)=> {            
             if (device.device_config !== ''){
                 //TODO: Fix sending device.device_config in blank, change interface type to class and buid config inside it.
                 sendConfig(esphomeServer,device.device_name,device.device_config);
             }
        });
        uploadFirmware(devicesNamesToUpdate[0]);
    }   
}
function closeModal(e: CustomEvent<any>): void {
    showPanelUpdater=false;
}

const tmpDevice = panel.devices.find((device) => {
    return device.device_name !== '';
});

if (tmpDevice) {
    currentStoreDevice = writable(tmpDevice);
    devicePanelName.set($currentStoreDevice.panelName);
    deviceArea.set($currentStoreDevice.device_area);
}
else {
    currentStoreDevice = writable(panel.devices[0]);
}
deviceArea.subscribe( (areaTxt) => {    
    panel.devices.forEach((device)=>{        
        device.device_area = areaTxt;
    });
});
devicePanelName.subscribe( (panelNameTxt) => {        
    panel.devices.forEach((device)=>{
        device.panelName = panelNameTxt;
    });
    $currentStoreDevice = $currentStoreDevice;
} );

preparePanel();
$devicePanelName = panel.panel_name;
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
                    <Grid.Col span={10}>
                        <TextInput
                        bind:value={$devicePanelName}
                        label="Panel name"                                                
                        />
                        <TextInput
                        label="Área"                                                
                        bind:value={$deviceArea}
                        />
                    </Grid.Col>                   
                </Grid>
                
            </Grid.Col>
            <Grid.Col span={7} >
                <DeviceEntitiesEditor 
                    devicePos={selectedButtonPos}
                    esphomeServer={esphomeServer} 
                    entitiesIds={entities} 
                    deviceStore={currentStoreDevice}
                    on:deviceUpdated={onDeviceUpdated} />                           
            </Grid.Col>
            
            <Grid.Col span={9}>
                <Button color="dark" on:click={runUpdater} >Upload Firmwares</Button>
            </Grid.Col>
        </Grid>
    </Card>
</Container>
<Space h='md'/>
<PanelUpdater 
    panelName={$devicePanelName}
    devicesNames={devicesNamesToUpdate} 
    opened={showPanelUpdater}
    close={closeModal} />