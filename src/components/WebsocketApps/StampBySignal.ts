import { WSMessage, WSMessageType } from './const';
import { AudioVideoFacade } from 'amazon-chime-sdk-js';


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
