
export interface WSMessage{
    action   : string
    cmd      : WSMessageType
    targetId : string
    private  : boolean
    content  : any
    done     : boolean
}

// This values are used in lambda (js). So keep human-readable.
export enum WSMessageType {
    Message  = "Message",
    Stamp    = "Stamp",
    Drawing  = "Drawing",
    File     = "File",
}

