
export function getProcessInstanceFromUrl(url){
    const regex = /process-instance\/([^\s/]+)/;
    const match = url.match(regex);
    return match?.[1] || "";
}

export function getProcessDefinitionFromUrl(url){
    const regex = /process-definition\/([^\s/]+)/;
    const match = url.match(regex);
    return match?.[1] || "";
}
    