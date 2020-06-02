import * as md5 from 'md5';
import { v4 as uuid } from 'uuid';
import { WSMessage, WSMessageType } from './const';
import { ReconnectingPromisedWebSocket } from 'amazon-chime-sdk-js';

export interface WSStamp{
    targetId  : string
    imgPath   : string
    startTime : number
}

//////////////////
// For Sender   //
//////////////////
export const sendStamp = (messagingSocket:ReconnectingPromisedWebSocket, targetId: string, imgPath: string, toPrivate: boolean) =>{

    const message:WSMessage = {
        action   : 'sendmessage',
        cmd      : WSMessageType.Stamp,
        targetId : targetId,
        private  : toPrivate,
        content  : {
            targetId: targetId,
            imgPath: imgPath,
            startTime: Date.now()
        },
        done     : false
    } 
    messagingSocket.send(JSON.stringify(message))
}
