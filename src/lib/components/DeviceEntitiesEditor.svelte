
<script lang='ts'>
    export const csr = true;
    export const ssr = false;
    import type {Device, Entity} from '$lib/hassinterfaces.js';
    import {log} from '$lib/logger';

    import {  Button, Checkbox, NativeSelect, Tabs, Space, TextInput, Stack } from '@svelteuidev/core';    
    import Svelecte from 'svelecte';

    import {afterUpdate} from 'svelte';
    import type {Writable} from 'svelte/store';
    import YAML from 'yaml';
    import { createEventDispatcher } from 'svelte';
    import Delete from 'svelte-material-icons/Delete.svelte';
    import { deviceUpdated, getEmptyDevice } from '$lib/hassinterfaces';
    import {EspHomeWebSockets} from '$lib/esphomewebsockets';

    export let deviceStore: Writable<Device>;
    export let entitiesIds: string[];
    export let esphomeServer: string;
    export let devicePos: number;
    
    const controlTypes: string[] = ["disabled","generic_toggle"]
    const CONTROL_TYPE_DISABLED: number = 0;
    const CONTROL_TYPE_GENERIC_TOGGLE: number = 1;
    const UNAVAILABLE_STATE: string = 'unavailable';

    let controlType: Entity;
    let controls: Entity ;
    let panelName: Entity ;
    let buttonPos: Entity;
    let disableRelay: boolean | undefined;    
    let lightEntity: Entity | undefined;
    let yamlTxt: string = '';
    let arraySelectedEntites: string[];

    const dispatch = createEventDispatcher();
    function getEmptyEntityObj(entityId:string, defaultState:string ):Entity{
        return {
                entity_id: entityId,
                state: defaultState,
                attributes: [],
                last_changed: '',
                last_updated: ''
            } ;
    }
    function getEntityObj(entityId:string, defaultState:string ):Entity{
        return $deviceStore.device_entities.find((entity:Entity)=>{
            return entity.entity_id === entityId;
        }) || getEmptyEntityObj(entityId, defaultState);
    }
    function prepareDeviceWithDefaults(){

        controlType = getEntityObj(`sensor.${$deviceStore.device_name}_control_type`, controlTypes[CONTROL_TYPE_DISABLED]);
        $deviceStore.device_entities.push(controlType);
      
        controls = getEntityObj(`sensor.${$deviceStore.device_name}_controls`, '');       
        $deviceStore.device_entities.push(controls);
        arraySelectedEntites = controls.state.split(',');

        panelName = getEntityObj(`sensor.${$deviceStore.device_name}_panel_name`, 'noName' );  
        $deviceStore.device_entities.push(panelName);

        buttonPos = getEntityObj(`sensor.${$deviceStore.device_name}_button_pos`,'-1');
        $deviceStore.device_entities.push(buttonPos);

        lightEntity = $deviceStore.device_entities.find((entity:Entity) => {
            return  entity.entity_id.startsWith('light');
        }) || getEmptyEntityObj( `light.${$deviceStore.device_name}_luz`, UNAVAILABLE_STATE);
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
                button_pos: buttonPos.state            
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
    }

    deviceStore.subscribe(()=>{
        prepareDeviceWithDefaults();    
    });

    afterUpdate(()=>{
            // prepareDeviceWithDefaults();  
        createConfig();      
    });

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
                body: yamlTxt, 
            });    
        const windowOptions = "width=800,height=600";
        window.open(esphomeServer, "_blank", windowOptions);
        log(response.text());   
    }
    function uploadFirmware(){
        const espHomeWebSockets:EspHomeWebSockets =  
                 new EspHomeWebSockets('https://esphome.sal.net.br/run',
                   'smr2010',
                   (e) => {console.log(e);});        
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
         bind:checked={disableRelay}     
         on:change={onDisableChange}   
         />
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
        <TextInput
        label="Panel name"
        bind:value={panelName.state}
        readonly
        />
        <TextInput
        label="Button Postion"
        bind:value={buttonPos.state}
        readonly
        />
        <span></span>
        </Stack>
        <Button color='dark' 
            disabled={$deviceStore.device_name === ''}
            on:click={removeButton}
            >
            <Delete width="md" ></Delete>
        </Button> 
    </Tabs.Tab>
    <Tabs.Tab label='Upload'>
        <Stack override={{ height: 380 }}  align="normal" spacing="xs">
            <textarea style="border-radius: 1%;" readonly id={$deviceStore.device_id}  bind:value={yamlTxt} rows="30" cols="35"></textarea>
            <Button fullSize color='dark' on:click={sendConfig}>Send Config Esphome</Button>
            <Button fullSize color='dark' on:click={uploadFirmware}>Upload Firmware</Button>
        </Stack>
    </Tabs.Tab>
</Tabs>