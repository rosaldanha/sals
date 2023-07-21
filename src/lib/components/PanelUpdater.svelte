<script lang='ts'>
    import { Modal, useSvelteUITheme } from "@svelteuidev/core";
    import {afterUpdate, onMount} from 'svelte';
    import DeviceUpdater from "./DeviceUpdater.svelte";


    //agrupar todos os botões do painel aqui em deviceUpdater
    export let devicesNames: string[];
    export let panelName: string;
    export let opened: boolean;
    export let close: any ;
    
    let title: string = `Painel: ${panelName}`

</script>

<Modal
    {opened}
    on:close={close}    
    overlayOpacity={0.55} 
    overlayBlur={3} 
    size="600px" 
    target={'body'}
    style="overflow-y: scroll"
    >    
    <h1>{title}</h1>
    {#each devicesNames as deviceName, index (deviceName) }
        <DeviceUpdater {deviceName} ></DeviceUpdater>
    {/each}
</Modal>