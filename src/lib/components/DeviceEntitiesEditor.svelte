<script lang='ts'>
    export const csr = true;
    export const ssr = false;
    import type {Device, Entity} from '$lib/hassinterfaces.js';
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
    let currentDevice: string = '';
   
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
        const retEntity: Entity|undefined = $deviceStore.device_entities.find((entity:Entity)=>{
            return entity.entity_id.toLowerCase() === entityId.toLowerCase();
        });        
        if (retEntity){           
            return retEntity
        }
        else {
            const newEntity = getEmptyEntityObj(entityId, defaultState);
            $deviceStore.device_entities.push(newEntity);
            return newEntity;
        }
        
    }
    function prepareDeviceWithDefaults(){
        
        controlType = getEntityObj(`sensor.${$deviceStore.device_name}_control_type`, controlTypes[CONTROL_TYPE_DISABLED]);
        
      
        controls = getEntityObj(`sensor.${$deviceStore.device_name}_controls`, '');               
        arraySelectedEntites = controls.state.split(',');

        panelName = getEntityObj(`sensor.${$deviceStore.device_name}_panel_name`, 'noName' );  
        

        buttonPos = getEntityObj(`sensor.${$deviceStore.device_name}_button_pos`,'-1');
        

        lightEntity = $deviceStore.device_entities.find((entity:Entity) => {
            return  entity.entity_id.startsWith('light');
        });
        if (lightEntity == undefined){
            lightEntity = getEmptyEntityObj( `light.${$deviceStore.device_name}_luz`, UNAVAILABLE_STATE);
            $deviceStore.device_entities.push(lightEntity);
        }
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
// ***************CREATE A FUNCTION SHARED HERE AND IN server/hassfunctions.ts **************
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
    function loadFromFormVars(){
        
        $deviceStore.device_entities.forEach((entity)=>{
            switch (entity.entity_id) {
                case `sensor.${$deviceStore.device_name}_control_type`:
                    entity.state = controlType.state;
                    break;
                case `sensor.${$deviceStore.device_name}_controls`:
                    controls.state = arraySelectedEntites.join(',');
                    entity.state = controls.state;
                case `sensor.${$deviceStore.device_name}_panel_name`:
                    logF('inside loadFromFormVars, panelName.state', panelName.state);
                    entity.state = panelName.state;
                case `sensor.${$deviceStore.device_name}_button_pos`:
                    entity.state = buttonPos.state;
                default:
                    if (entity.entity_id.startsWith('light')){
                        entity.state = lightEntity!.state;
                    }
                    break;
            }
            
        })
    }
    function createConfig(){
        // controls!.state = arraySelectedEntites.join(',');
        // yamlTxt = YAML.stringify({
        //     substitutions:{
        //         device_name: $deviceStore.device_name,                       
        //         control_type: controlType?.state ,
        //         isRelayDisabled: `${disableRelay}`,
        //         panel_name: panelName?.state,
        //         button_pos: buttonPos.state            
        //     }},
        //     {
        //         defaultStringType: 'QUOTE_DOUBLE',
        //         defaultKeyType: 'PLAIN',
        //         trueStr: 'true',
        //         falseStr: 'false',
        //         doubleQuotedAsJSON: true
        //     });
        // const controls_state = controls?.state;
        // yamlTxt += `  control_list: "${controls_state}"\n`
        // yamlTxt += buildComments();   
        // yamlTxt += '\n<<: !include common/smr2.yaml'
        // $deviceStore.device_config = yamlTxt;
        logF('createConfig BEFORE loadFromFormVars', $deviceStore);
        loadFromFormVars();
        logF('createConfig AFTER loadFromFormVars', $deviceStore);
        const deviceConfig : DeviceConfig = new DeviceConfig($deviceStore);
        yamlTxt = deviceConfig.getConfig();
        $deviceStore.device_config = yamlTxt;
    }
    
//****************************************************************/
    
    deviceStore.subscribe(()=>{
        prepareDeviceWithDefaults();    
        
    });
    prepareDeviceWithDefaults(); 
    afterUpdate(()=>{         
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
         bind:checked={disableRelay}     
         on:change={onDisableChange}   
         />
        <NativeSelect data={controlTypes}
        bind:value={controlType.state}        
        label="Control Type"
        description="Select how to control entities or disable"
        style="margin-bottom: 10px;"
        />
        <!-- <label  for="controls">Select one or more entities</label> -->
        <span> Select one or more entities</span>
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
            <Delete ></Delete>
        </Button> 
    </Tabs.Tab>
    <Tabs.Tab label='Upload'>
        <Stack override={{ height: 380 }}  align="normal" spacing="xs">
            <textarea style="border-radius: 1%;" readonly id={$deviceStore.device_id}  bind:value={yamlTxt} rows="30" cols="35"></textarea>
            <Button fullSize color='dark' on:click={sendConfig}>Send Config Esphome</Button>           
        </Stack>
    </Tabs.Tab>
</Tabs>

