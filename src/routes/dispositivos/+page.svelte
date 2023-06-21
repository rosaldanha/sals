<script lang="ts">
    import {Input,InputWrapper , Card,Text, Container,Center} from '@svelteuidev/core';
    import type {Device, Entity} from '$lib/hassinterfaces.js';
    import {deviceCapabilities} from '$lib/hassinterfaces.js'
    import DeviceView from '$lib/components/DeviceView.svelte';
   
    export let data: any;
    // console.log(data,'dispositivos')
    const isDebugging = true;

    
</script>

<Center>
    <h1>Dispositivos</h1>
</Center>


<Container size='xs'>
    {#each data.devices as device }
        <Card shadow='lg' withBorder radius='lg' padding='xs'>
        	<Card.Section  padding='sm'>
                <DeviceView {device}/>
            </Card.Section>
        {#if isDebugging}   
            <InputWrapper label='Name'>
                <Input    
                disabled           
                bind:value={device.device_name}
                radius="xl"
                size="sm"
                />
            </InputWrapper>    
            <InputWrapper label='ID'>
                <Input    
                disabled           
                bind:value={device.device_id}
                radius="xl"
                size="sm"
                />
            </InputWrapper>    
            <InputWrapper label='AREA'>
                <Input    
                disabled           
                bind:value={device.device_area}
                radius="xl"
                size="sm"
                />
            </InputWrapper>                                    
            {#each device.device_entities as entity, idx}            
             <InputWrapper label={entity.entity_id}>
                <Input    
                disabled           
                bind:value={entity.state}
                radius="xl"
                size="sm"
                />
            </InputWrapper>
            {/each}            
        {/if}
        </Card>
       
   <br/>
   {/each}
</Container>
