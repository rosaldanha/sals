export function log(...obj:any){
    console.log(obj.join(','));
}
export function error(...obj:any){
    console.log(obj);
}
export function logF(where:string,obj:any){
    //console.log(where, JSON.parse(JSON.stringify(obj))); 
}