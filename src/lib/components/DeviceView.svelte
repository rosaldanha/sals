<script lang="ts">
    
    import { Center, ActionIcon , Group }  from '@svelteuidev/core';
    import {createEventDispatcher} from 'svelte';
    import LightSwitchOff from 'svelte-material-icons/LightSwitchOff.svelte';
    import AccessPointNetworkOff from 'svelte-material-icons/AccessPointNetworkOff.svelte';
    import LightbulbOnOutline from 'svelte-material-icons/LightbulbOnOutline.svelte';
    import CogOutline from 'svelte-material-icons/CogOutline.svelte';
    import type {Device, Entity} from '$lib/hassinterfaces.js';
    
    import {deviceCapabilities,deviceViewSettingsClickEvent} from '$lib/hassinterfaces.js'


    export let device: Device;   
    export let index = -1;
    const deviceFunctions = getDeviceFunctions(device);
    const iconSize = "2em";
    let dispatch = createEventDispatcher();

    function getDeviceFunctions(device : Device): string[] {
        if (device.device_entities.length == 2 ){
            return [deviceCapabilities['offline']];
        }
        else
        {
            let retValue: string[] = [];
           
            device.device_entities.forEach(entityTmp => {
                // console.log(entityTmp,device,'blow')
                if (entityTmp.entity_id.startsWith('light.')){
                    if (entityTmp.state === 'off' || entityTmp.state === 'on')
                    {
                        retValue.push(deviceCapabilities['light']);
                    }
                }
                if (entityTmp.entity_id.endsWith('control_type')){
                    if (entityTmp.state === 'generic_toggle'){
                        retValue.push(deviceCapabilities['switch']);
                    }
                }
            });
            if (retValue.length === 0){
                return [deviceCapabilities['offline']];
            }
            else {
                return retValue;
            }

        }
        return [deviceCapabilities['offline']];
    }

    function onClickSettings(){
        dispatch(deviceViewSettingsClickEvent,  {device, index});
    }
</script>
<Center>
    <Group spacing="xs" position='center'>
        <h2>    
        {device.device_name} 
        </h2>            
        {#if deviceFunctions.includes(deviceCapabilities['offline']) }
                <AccessPointNetworkOff size={iconSize}/>
        {:else}
            {#if deviceFunctions.includes(deviceCapabilities['light'])}
                <LightbulbOnOutline size={iconSize} />
            {/if}
            {#if deviceFunctions.includes(deviceCapabilities['switch'])}
                <LightSwitchOff size={iconSize}/>
            {/if}
            <ActionIcon   color="dark" size="lg" on:click={onClickSettings}  >                  
                <CogOutline size={iconSize}  />
            </ActionIcon >
        {/if}  
    </Group>
</Center>