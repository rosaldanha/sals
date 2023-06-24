
<script lang='ts'>
    export const csr = true;
    export const ssr = false;
    import type {Device, Entity} from '$lib/hassinterfaces.js'
    import {  Button, Checkbox, NativeSelect, SimpleGrid, Space, TextInput } from '@svelteuidev/core';
    
    import Svelecte from 'svelecte';
    import {afterUpdate} from 'svelte';
    import type {Writable} from 'svelte/store';
    import { io } from 'socket.io-client';
  
    //import {getEntities} from '$lib/server/hassfunctions.server';
    
    import YAML from 'yaml';
    export let deviceStore: Writable<Device>;
    export let entitiesIds: string[];
    //export let entities: string[];
    const controlTypes: string[] = ["disabled","generic_toggle"]
    const CONTROL_TYPE_DISABLED: number = 0;
    const CONTROL_TYPE_GENERIC_TOGGLE: number = 1;
    const UNAVAILABLE_STATE: string = 'unavailable';

    let controlType: Entity;
    let controls: Entity ;
    let panelName: Entity ;
    let disableRelay: boolean | undefined;    
    let lightEntity: Entity | undefined;
    let yamlTxt: string = '';
    let arraySelectedEntites: string[];

    function prepareDeviceWithDefaults(){
        
        //const device = $deviceStore;
         
        
        controlType = $deviceStore.device_entities.find((entity:Entity)=>{
            return entity.entity_id === `sensor.${$deviceStore.device_name}_control_type`;
        }) || {
                entity_id: `sensor.${$deviceStore.device_name}_control_type`,
                state: controlTypes[CONTROL_TYPE_DISABLED],
                attributes: [],
                last_changed: '',
                last_updated: ''
            } ;
        $deviceStore.device_entities.push(controlType);
        controls = $deviceStore.device_entities.find((entity:Entity)=>{
            return entity.entity_id === `sensor.${$deviceStore.device_name}_controls`;
        }) || {
                entity_id: `sensor.${$deviceStore.device_name}_controls`,
                state: '',
                attributes: [],
                last_changed: '',
                last_updated: ''
            } ;        
        $deviceStore.device_entities.push(controls);
        arraySelectedEntites = controls.state.split(',');

        panelName = $deviceStore.device_entities.find((entity:Entity)=>{
            return entity.entity_id === `sensor.${$deviceStore.device_name}_panel_name`;
        }) || {
                entity_id: `sensor.${$deviceStore.device_name}_panel_name`,
                state: 'noName',
                attributes: [],
                last_changed: '',
                last_updated: ''
            } ;        
            $deviceStore.device_entities.push(panelName);
        

        lightEntity = $deviceStore.device_entities.find((entity:Entity) => {
            return  entity.entity_id.startsWith('light');
        }) || {
                entity_id: `light.${$deviceStore.device_name}_luz`,
                state: UNAVAILABLE_STATE,
                attributes: [],
                last_changed: '',
                last_updated: ''
            } ;
            $deviceStore.device_entities.push(lightEntity);
                
        if (lightEntity.state === UNAVAILABLE_STATE) {
            disableRelay = true;
        }
        else {
            disableRelay = false;                
        }
    }
    function onDisableChange(e:any){        
        if (e.target.checked){
            lightEntity!.state = UNAVAILABLE_STATE;
        }
        else
        {
            lightEntity!.state = 'off';
        }
    }
    function buildComments(){
        let retValue: string = '';
        if (lightEntity?.state !== UNAVAILABLE_STATE) {
            retValue += lightEntity?.entity_id.replace('light.','');
        }
        else {
            retValue += 'noRelay';
        }
        retValue += ' | ';
        if (controlType?.state == controlTypes[CONTROL_TYPE_DISABLED]) {
            retValue += 'noControl';
        }
        else {
            retValue += controls?.state;
        }
        return `  comment: "${retValue}"\n`;
    }
    function createConfig(){
        controls!.state = arraySelectedEntites.join(',');
        yamlTxt = YAML.stringify({
            substitutions:{
                device_name: $deviceStore.device_name,                       
                control_type: controlType?.state ,
                isRelayDisabled: `${disableRelay}`,
                panel_name: panelName?.state,            
            }},
            {
                defaultStringType: 'QUOTE_DOUBLE',
                defaultKeyType: 'PLAIN',
                trueStr: 'true',
                falseStr: 'false',
                doubleQuotedAsJSON: true
            });
        const controls_state = controls?.state;
        yamlTxt += `  control_list: "${controls_state}"\n`
        yamlTxt += buildComments();   
        yamlTxt += '\n<<: !include common/smr2.yaml'
        //console.log(yamlTxt)

    }
    deviceStore.subscribe(()=>{
        prepareDeviceWithDefaults();    
    });

    
    afterUpdate(()=>{
            // prepareDeviceWithDefaults();  
        createConfig();      
    });
async function sendConfig(){
    const serverUrl = "https://esphome.sal.net.br"

    const url = `${serverUrl}/edit?configuration=${$deviceStore.device_name}.yaml`;
    const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "no-cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: yamlTxt, // body data type must match "Content-Type" header
    });
  
    const windowOptions = "width=800,height=600";
    window.open(serverUrl, "_blank", windowOptions);
    console.log(response.text());
   
}
</script>
<!-- a -->
<style>
    textarea {
        overflow: auto;
        white-space: pre;
    }
</style>
<SimpleGrid cols={3} spacing="lg" >
    <div>
        <h2>{$deviceStore.device_name}</h2>       
        <NativeSelect data={controlTypes}
        bind:value={controlType.state}        
        label="Control Type"
        description="Select how to control entities or disable"
        style="margin-bottom: 10px;"
        />
        <!-- <TextInput
        label="Controls"
        description = "Entities that are controlled by this device"
        bind:value={controls.state}        
        /> -->
        <label  for="controls">Select one or more entities</label>
        <Svelecte options={entitiesIds}
        bind:value={arraySelectedEntites}        
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

        
    </div>
    <div>
        <TextInput
        label="Panel name"
        description = "Where this device is ?"
        bind:value={panelName.state}        
        />
        <Space h='xs'></Space>
        <Checkbox
         label="Local Relay Disabled"
         color="dark"
         radius="lg"
         size='md'
         bind:checked={disableRelay}     
         on:change={onDisableChange}   
         />
         <!-- <Space h='xs'></Space>
         <Button color='dark' on:click={createConfig}>Create Config</Button> -->
    </div>
    <div>
        <textarea style="border-radius: 5%;" readonly id={$deviceStore.device_id}  bind:value={yamlTxt} rows="15" cols="35"></textarea>
        <Button color='dark' on:click={sendConfig}>Send Config Esphome</Button>
    </div>    
</SimpleGrid>