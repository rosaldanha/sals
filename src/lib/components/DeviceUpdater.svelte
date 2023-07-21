<script lang='ts'>
    import {panels} from '$lib/stores/panelsupdater';
    import {STATUS, type PanelUpdate}  from '$lib/stores/panelsupdater';
    import { Grid, Progress } from '@svelteuidev/core';
    import LedIcon from './LedIcon.svelte';
    
    export let deviceName: string;
    let compileIconColor = "gray";
    let configIconColor = "gray";
    let otaIconColor = "gray"
    let percentOta = 0;
    let percentOtaText = "";
    let localPanel: PanelUpdate|undefined;
    
    function getStatusColor(status: STATUS):string {
        switch (status) {
            case STATUS.STOPED:
                return "gray";
            case STATUS.RUNNING:
                return "yellow";
            case STATUS.DONE:
                return "green";        
            default:
                return 'red';
        }        
    }

    panels.subscribe(
        (panelsToUpdate:PanelUpdate[]) => {
            const panelToReplace =  panelsToUpdate.find( panel => { 
                return panel.deviceName === deviceName;
            });
            localPanel = panelToReplace;
            configIconColor  = getStatusColor(localPanel!.configStatus);
            compileIconColor = getStatusColor(localPanel!.compileStatus);
            otaIconColor     = getStatusColor(localPanel!.uploadStatus);
            percentOta       = localPanel!.uploadPercent;
            percentOtaText   = `${percentOta} %`;
        });
</script>

<Grid spacing="xs" grow={true}>
    <Grid.Col span={12}>
       <h1>Device: {localPanel?.deviceName}</h1> 
    </Grid.Col>
    <Grid.Col span={4}>
        <h3>Config <LedIcon color={configIconColor} /></h3>
    </Grid.Col>
    <Grid.Col span={4}>
        <h3>Compile <LedIcon color={compileIconColor} /></h3>
    </Grid.Col>
    <Grid.Col span={4}>
        <h3>Upload <LedIcon color={otaIconColor} /></h3>
    </Grid.Col>
    <Grid.Col span={12}>
        <Progress size="lg"  value={percentOta} label={percentOtaText} />
    </Grid.Col>
</Grid>