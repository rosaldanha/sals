<script lang='ts'>
    export const csr = true;
    export const ssr = false;
   //import type {Device, Entity} from '$lib/hassinterfaces.js';
    import type {Device } from '$lib/device';
    import {control_types} from '$lib/device';
    import {Entity} from '$lib/entity';
    import {log} from '$lib/logger';
    import {  Button, Checkbox, NativeSelect, Tabs, TextInput, Stack } from '@svelteuidev/core';    
    import Svelecte from 'svelecte';

    import {afterUpdate} from 'svelte';
    import type {Writable} from 'svelte/store';
    import { createEventDispatcher } from 'svelte';
    import Delete from 'svelte-material-icons/Delete.svelte';
    import { deviceUpdated, getEmptyDevice } from '$lib/hassinterfaces';
    import {DeviceConfig } from '$lib/deviceconfig';
    import { logF } from '$lib/logger';

    export let deviceStore: Writable<Device>;
    export let entitiesIds: string[];
    export let esphomeServer: string;
    export let devicePos: number;
    logF('first load deviceEntitiesEditor',$deviceStore);
    const controlTypes: string[] = Object.values(control_types) as string[];
    const CONTROL_TYPE_DISABLED: number = 0;
    const CONTROL_TYPE_GENERIC_TOGGLE: number = 1;
    const UNAVAILABLE_STATE: string = 'unavailable';

    // let controlType: Entity;
    // let controls: Entity ;
    // let panelName: Entity ;
    // let buttonPos: Entity;
    // let disableRelay: boolean | undefined;    
    // let lightEntity: Entity | undefined;
    // let yamlTxt: string = '';
    // let arraySelectedEntites: string[];
    let currentDevice: string = '';
   
    const dispatch = createEventDispatcher();

 
    function prepareDeviceWithDefaults(){
        

        
    }
    function onDisableChange(e:any){        
 
    }

    

    async function sendConfig(){
        const url = `${esphomeServer}/edit?configuration=${$deviceStore.device_name}.yaml`;
        const response = await fetch(url, {
                method: "POST", 
                mode: "no-cors",
                cache: "no-cache",                
                headers: {
                "Content-Type": "application/json",
                },
                referrerPolicy: "no-referrer", 
                body: $deviceStore.device_config, 
            });    
        //const windowOptions = "width=800,height=600";
        //window.open(esphomeServer, "_blank", windowOptions);
        log(response.text());   
    }
    function removeButton() {
        if (confirm('Confirm to remove the device?')) {
            const tmpDevice = getEmptyDevice();
            dispatch(deviceUpdated,{
                device: tmpDevice,
                pos: devicePos,
            } )
        }
        
    }
    logF('end load deviceEntitiesEditor',$deviceStore);
</script>
<!-- a -->
<style>
    textarea {
        overflow: auto;
        white-space: pre;
        width: 100%;
    }
</style>
<Tabs grow>
    <Tabs.Tab label={$deviceStore.device_name} >
        <Stack override={{ height: 380 }}  align="strech" spacing="xs">
        <Checkbox
         label="Local Relay Disabled"
         color="dark"
         radius="sm"
         size='sm'
         bind:checked={$deviceStore.disableRelay}     
         on:change={onDisableChange}   
         />
        <NativeSelect 
        data={controlTypes}        
        bind:value={$deviceStore.controlType}        
        label="Control Type"
        description="Select how to control entities or disable"
        style="margin-bottom: 10px;"
        />
        <!-- <label  for="controls">Select one or more entities</label> -->
        <span> Select one or more entities</span>
        <Svelecte options={entitiesIds}
        bind:value={$deviceStore.controlsArray}        
        labelAsValue
        multiple
        highlightFirstItem={false}
        placeholder="Controls"        
        virtualList     
        style="z-index: 10;height: 30px; margin-top: 5px;"   
        alwaysCollapsed={true}
        collapseSelection={true}
        inputId="controls"
        ></Svelecte>
        <TextInput
        label="Panel name"
        bind:value={$deviceStore.panelName}
        readonly
        />
        <TextInput
        label="Button Postion"
        bind:value={$deviceStore.buttonPos}
        readonly
        />
        <span></span>
        </Stack>
        <Button color='dark' 
            disabled={$deviceStore.device_name === ''}
            on:click={removeButton}
            >
            <Delete ></Delete>
        </Button> 
    </Tabs.Tab>
    <Tabs.Tab label='Upload'>
        <Stack override={{ height: 380 }}  align="normal" spacing="xs">
            <textarea style="border-radius: 1%;" readonly id={$deviceStore.device_id}  bind:value={$deviceStore.device_config} rows="30" cols="35"></textarea>
            <Button fullSize color='dark' on:click={sendConfig}>Send Config Esphome</Button>           
        </Stack>
    </Tabs.Tab>
</Tabs>

