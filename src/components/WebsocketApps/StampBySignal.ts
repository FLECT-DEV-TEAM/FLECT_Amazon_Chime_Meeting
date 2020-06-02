import * as md5 from 'md5';
import { v4 as uuid } from 'uuid';
import { WSMessage, WSMessageType } from './const';
import { ReconnectingPromisedWebSocket, AudioVideoFacade } from 'amazon-chime-sdk-js';


//////////////////
// For Sender   //
//////////////////
export const sendStampBySignal = (audioVideo:AudioVideoFacade, targetId: string, imgPath: string, toPrivate: boolean) =>{

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
    audioVideo.realtimeSendDataMessage(WSMessageType.Stamp, JSON.stringify(message))
}
