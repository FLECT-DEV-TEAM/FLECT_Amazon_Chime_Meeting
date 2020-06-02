import * as md5 from 'md5';
import { v4 as uuid } from 'uuid';
import { WSMessage, WSMessageType } from './const';
import { ReconnectingPromisedWebSocket } from 'amazon-chime-sdk-js';


export interface WSText{
    targetId  : string
    text      : string
    startTime : number
}

//////////////////
// For Sender   //
//////////////////
export const sendText = (messagingSocket:ReconnectingPromisedWebSocket, targetId: string, text: string, toPrivate: boolean) =>{

    const message:WSMessage = {
        action   : 'sendmessage',
        cmd      : WSMessageType.Text,
        targetId : targetId,
        private  : toPrivate,
        content  : {
            targetId: targetId,
            text: text,
            startTime: Date.now()
        },
        done     : false
    } 
    messagingSocket.send(JSON.stringify(message))
}
