import { DefaultActiveSpeakerPolicy, AudioVideoFacade, DataMessage } from "amazon-chime-sdk-js";
import App from "./App";

export const setRealtimeSubscribeToAttendeeIdPresence= (app:App, audioVideo:AudioVideoFacade) => {

    const handler = (attendeeId: string, present: boolean): void => {
        console.log(`${attendeeId} present = ${present}`);
        if (!present) {
            app.deleteAttendee(attendeeId)
            return;
        }
        audioVideo.realtimeSubscribeToVolumeIndicator(
            attendeeId,
            async (
                attendeeId: string,
                volume: number | null,
                muted: boolean | null,
                signalStrength: number | null
            ) => {
                app.changeAttendeeStatus(attendeeId, volume, muted, signalStrength)
            }
        );
    };    
    audioVideo.realtimeSubscribeToAttendeeIdPresence(handler);
}


export const setSubscribeToActiveSpeakerDetector = (app:App, audioVideo:AudioVideoFacade) => {
    const activeSpeakerHandler = (attendeeIds: string[]): void => {
        //console.log("active1", attendeeIds)
        for (const attendeeId of attendeeIds) {
            app.changeActiveSpeaker(attendeeId)
        }
    };
    audioVideo.subscribeToActiveSpeakerDetector(
        new DefaultActiveSpeakerPolicy(),
        activeSpeakerHandler,
        (scores: { [attendeeId: string]: number }) => {
            app.updateActiveScore(scores)
        },
        100 //this.showActiveSpeakerScores ? 100 : 0, TODO
    );
}




// DataMessage
export const setRealtimeSubscribeToReceiveDataMessage = (app:App, audioVideo:AudioVideoFacade, topic:string) =>{
    const receiveDataMessageHandler = (dataMessage: DataMessage): void => {
        app.receivedDataMessage(dataMessage)
    }
    audioVideo.realtimeSubscribeToReceiveDataMessage(topic, receiveDataMessageHandler)
    
}

    