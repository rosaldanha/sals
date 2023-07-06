<script lang='ts'>
    import {panels} from '$lib/stores/panelsupdater';
    import type {PanelUpdate}  from '$lib/stores/panelsupdater';
    
    let localPanel: PanelUpdate|undefined;

    panels.subscribe(
        (panelsToUpdate:PanelUpdate[]) => {
        const panelToReplace =  panelsToUpdate.find( panel => { 
            return panel.deviceName === localPanel!.deviceName;
        });
        localPanel = panelToReplace; }
    );
</script>

<span>Device: {localPanel?.deviceName}</span>
<span>Config Status: {localPanel?.configStatus}</span>
<span>Compile Status: {localPanel?.compileStatus}</span>
<span>Uploaded: {localPanel?.uploadPercent}%</span>
<span>Upload Status: {localPanel?.uploadStatus}</span>