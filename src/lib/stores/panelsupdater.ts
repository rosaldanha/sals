import { writable, type Writable } from "svelte/store";
export enum STATUS {
    RUNNING = "running",
    STOPED = "stoped",
    DONE = "done"
}
export interface PanelUpdate {
    deviceName: string;
    configStatus: STATUS;
    compileStatus: STATUS;
    uploadStatus: STATUS;
    uploadPercent: number;
}

export const panels: Writable<PanelUpdate[]> = writable([]);
