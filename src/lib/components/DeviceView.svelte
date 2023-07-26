<script lang="ts">
    
    import { Center, ActionIcon , Group, Grid, Button, Space, Tooltip }  from '@svelteuidev/core';
    import {createEventDispatcher} from 'svelte';    
    import AccessPointNetworkOff from 'svelte-material-icons/AccessPointNetworkOff.svelte';    
    import CogOutline from 'svelte-material-icons/CogOutline.svelte';
    import HomeSearchOutline from 'svelte-material-icons/HomeSearchOutline.svelte';
   
    //import type {Device, Entity} from '$lib/hassinterfaces.js';
    import { Device } from '$lib/device';
    import {Entity} from '$lib/entity';
    import type {Panel} from '$lib/panel';

    import { HomeAssistantSocket } from '$lib/hasswebsockets';
    import {log,logF} from '$lib/logger';
    import {deviceIsSearching,deviceViewSettingsClickEvent} from '$lib/hassinterfaces.js';    
    //import { buildDeviceObj } from '$lib/hassfunctions';
    import LedIcon from '$lib/components/LedIcon.svelte';


    export let device: Device;   
    export let index = -1;
    export let esphomeEntitiesToWatch: string[];
    export let homeAssistantUrl: string;
    export let accessToken: string;
    export let panel:Panel;
    export let disabled: boolean|undefined = undefined;
    logF('load deviceView device:',device);
   // logF('deviceView FirstLoad panel:',panel);
    
    const iconSize = "1.5em";
    let dispatch = createEventDispatcher();
    let homeAssistantSocket: HomeAssistantSocket|null = null;
    let loading: boolean = false;
    
    
    async function getBuiltDeviceObj(entityId:string):Promise<Device> {
        const response = await fetch('/hass/device', {
            method: 'POST',
            body: JSON.stringify({ entityId }),
            headers: {
                'content-type': 'application/json'
            }
        });
        const result = await response.json();        
        
        return new Device(result);
    }
    function setPositionEntity(index:number): void {
        device.buttonPos = index;


    }
    function handleSearch(result:any, listener: any ){ 
        (async function() {
            log(result.variables.trigger.entity_id,2);
            loading = false;
            dispatch(deviceIsSearching,{isSearching: false});
            device = await getBuiltDeviceObj(result.variables.trigger.entity_id);
            device.buttonPos = index;
            device.panelName = panel.panel_name;
            panel.devices[index] =  device;
            homeAssistantSocket?.socket.removeEventListener('message',listener);             
            homeAssistantSocket = null;
        })();
    }    

    function onClickSettings(){
        if (device.device_name === ''){
            homeAssistantSocket =  new HomeAssistantSocket(homeAssistantUrl,accessToken);
            //log(homeAssistantSocket);      
            loading = true;
            dispatch(deviceIsSearching,{isSearching: true});
            setTimeout(() => {
                log('send Event');
                console.log('esphomeEntitiesToWatch',esphomeEntitiesToWatch)
                homeAssistantSocket!.subscribeToStateTrigger(esphomeEntitiesToWatch,handleSearch);    
            }, 1000);
            
        }
        else{
            dispatch(deviceViewSettingsClickEvent,  {device, index});
        }        
    }
    logF('end deviceView device:',device);
</script>
<Grid spacing='xs'   >
    {#if device.device_name === ''}
        <Grid.Col span={6}>            
            <Button {disabled} {loading} color="dark" size="xs" on:click={onClickSettings}  >                  
                <HomeSearchOutline slot='leftIcon' size={iconSize}  /> {index}
            </Button>            
        </Grid.Col>
    {:else}
        <Grid.Col span={6}>
            <Tooltip radius='sm' withArrow placement="end" label={device.device_name}>
                <Button {disabled} color="dark" size="xs" on:click={onClickSettings}  >                  
                    {#if device.device_name === ''}
                        <HomeSearchOutline slot='leftIcon' size={iconSize}  /> {index} 
                    {:else}
                        <CogOutline slot='leftIcon' size={iconSize}  /> <Space w='xs'></Space> {index} 
                    {/if}
                </Button>
            </Tooltip>                 
        </Grid.Col>
    {/if}
</Grid>