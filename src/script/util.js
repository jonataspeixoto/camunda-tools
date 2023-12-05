
export function getProcessInstanceFromUrl(url){
    const regex = /process-instance\/([a-f0-9-]+)/;
    const match = url.match(regex);
    return match?.[1] || "";
}
    
    