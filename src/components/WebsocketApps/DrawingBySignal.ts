import { WSMessageType } from './const';
import { AudioVideoFacade } from 'amazon-chime-sdk-js';

export enum DrawingType {
    Draw,
    Erase,
    Clear,
}

export interface WSDrawing{
    targetId    : string
    mode        : DrawingType
    startXR     : number
    startYR     : number
    endXR       : number
    endYR       : number
    stroke      : number
    lineWidth   : number    
}

//////////////////
// For Sender   //
//////////////////
export const sendDrawingBySignal = (audioVideo:AudioVideoFacade, targetId: string, mode:string, startXR:number, startYR:number, endXR:number, endYR:number, stroke:string, lineWidth:number, toPrivate: boolean)=>{


    const message={
        action: 'sendmessage',
        cmd      : WSMessageType.Drawing,
        targetId : targetId,
        private  : toPrivate,
        content  : { 
            targetId    : targetId, 
            // startTime   : Date.now(),
            mode        : mode,
            startXR     : startXR,
            startYR     : startYR,
            endXR       : endXR,
            endYR       : endYR,
            stroke      : stroke,
            lineWidth   : lineWidth
        },
        done     : false        
    }
    audioVideo.realtimeSendDataMessage(WSMessageType.Drawing, JSON.stringify(message))

}
