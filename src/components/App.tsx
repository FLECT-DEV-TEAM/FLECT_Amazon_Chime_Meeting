import * as React from 'react';
import { GlobalState } from '../reducers';
import { AppStatus, LOGGER_BATCH_SIZE, LOGGER_INTERVAL_MS, AppStatus2 } from '../const';
import * as bodyPix from '@tensorflow-models/body-pix';

import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration,
    Logger,
    MeetingSessionPOSTLogger,
    VideoTileState
} from 'amazon-chime-sdk-js';
import Entrance from './Entrance';
import Lobby from './Lobby';
import SelectDevice from './SelectDevice';
import InMeetingRoom from './InMeetingRoom';
import DeviceChangeObserverImpl from './DeviceChangeObserverImpl';
import AudioVideoObserverImpl from './AudioVideoObserverImpl';
import ContentShareObserverImpl from './ContentShareObserverImpl';
import { setRealtimeSubscribeToAttendeeIdPresence, setSubscribeToActiveSpeakerDetector } from './subscribers';


/**
 * 
 * @param meetingSessionConf 
 */
const initializeMeetingSession = (gs: GlobalState, meetingSessionConf: MeetingSessionConfiguration):DefaultMeetingSession => {

    let logger: Logger;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logger = new ConsoleLogger('SDK', LogLevel.WARN);
    } else {
        logger = new MeetingSessionPOSTLogger(
            'SDK',
            meetingSessionConf,
            LOGGER_BATCH_SIZE,
            LOGGER_INTERVAL_MS,
            `${gs.baseURL}logs`,
            LogLevel.WARN
        );
    }
    const deviceController = new DefaultDeviceController(logger);
    meetingSessionConf.enableWebAudio = false;
    meetingSessionConf.enableUnifiedPlanForChromiumBasedBrowsers = true
    const meetingSession = new DefaultMeetingSession(meetingSessionConf, logger, deviceController);
    return meetingSession
}


/**
 * 
 * @param app 
 * @param props 
 * @param meetingSession 
 */
const registerHandlers = (app:App, props:any, meetingSession:DefaultMeetingSession) =>{
    meetingSession.audioVideo.addDeviceChangeObserver(new DeviceChangeObserverImpl(app, props));
    meetingSession.audioVideo.setDeviceLabelTrigger(
        async (): Promise<MediaStream> => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            console.log("setDeviceLabelTrigger")
            return stream;
        }
    );    

    meetingSession.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio((isMuted: boolean): void => {
        console.log(`muted = ${isMuted}`);
    })

    meetingSession.audioVideo.realtimeSubscribeToSetCanUnmuteLocalAudio((canUnmute: boolean): void => {
        console.log(`canUnmute = ${canUnmute}`);
    })

    meetingSession.audioVideo.addObserver(new AudioVideoObserverImpl(app));
    meetingSession.audioVideo.addContentShareObserver(new ContentShareObserverImpl(app, props));

    setRealtimeSubscribeToAttendeeIdPresence(app, meetingSession.audioVideo)
    setSubscribeToActiveSpeakerDetector(app, meetingSession.audioVideo)

}

/**
 * 
 */
export interface Attendee{
    attendeeId     : string
    name           : string  | null
    active         : boolean
    volume         : number  | null
    muted          : boolean | null
    signalStrength : number  | null
}

/**
 * 
 */
export interface AppState{
    videoTileStates : {[id:number]:VideoTileState}
    roster          : {[attendeeId:string]:Attendee}
    bodyPix         : bodyPix.BodyPix | null
}

/**
 * Main Component
 */
class App extends React.Component {

    state:AppState = {
        videoTileStates:{},
        roster:{},
        bodyPix : null
    }

    /***************************
    *  Callback for tile change
    ****************************/
    updateVideoTileState = (state: VideoTileState) => {
        let needUpdate = false
        if(this.state.videoTileStates[state.tileId!]){
        } else{
            needUpdate = true
        }
        this.state.videoTileStates[state.tileId!] = state
        if(needUpdate){
            this.setState({})
        }
        //console.log("updateVideoTileState",  this.state.videoTileState)
    }
    removeVideoTileState = (tileId: number) => {
        delete this.state.videoTileStates[tileId]
        this.setState({})
    }
    /***************************
    *  Callback for attendee change
    ****************************/
    deleteAttendee = (attendeeId:string) => {
        console.log("deleteAttendee")
        delete this.state.roster[attendeeId]
        this.setState({})
    }
    changeAttendeeStatus = (attendeeId:string, volume:number|null, muted:boolean|null, signalStrength:number|null) =>{
        console.log("changeAttendeeStatus", attendeeId)
        const props = this.props as any
        const gs = this.props as GlobalState
        //props.changeAttendeeStatus(attendeeId, volume, muted, signalStrength, gs.baseURL, gs.roomID)

        if( (attendeeId in this.state.roster) === false){
            this.state.roster[attendeeId] = {
                attendeeId     : attendeeId,
                name           : null,
                active         : false,
                volume         : null,
                muted          : null,
                signalStrength : null
            }
        }

        if(volume !== null){
            this.state.roster[attendeeId].volume = volume
        }
        if(muted !== null){
            this.state.roster[attendeeId].muted = muted
        }
        if(signalStrength !== null){
            this.state.roster[attendeeId].signalStrength = signalStrength
        }
        if(this.state.roster[attendeeId].name === null || this.state.roster[attendeeId].name === "Unknown"){ // ChimeがUnknownで返すときがある
            props.getAttendeeInformation(gs.baseURL, gs.roomTitle, attendeeId)
        }
        this.setState({})
    }
    changeActiveSpeaker = (attendeeId:string) =>{
        //console.log("changeActiveSpeaker")
        // const props = this.props as any
        //props.changeActiveSpeaker(attendeeId)
    }
    updateActiveScore = (scores:{ [attendeeId: string]: number }) =>{
        // const props = this.props as any
        //console.log("updateActiveScore")
        //props.updateActiveScore(scores)
    }


    enterMeetingRoom=()=>{

    }


    render() {
        const gs = this.props as GlobalState
        const props = this.props as any
        const bgColor="#eeeeee"
        /**
         * For Login screen
         */
        if(gs.status === AppStatus.STARTED){
            const base_url: string = [window.location.protocol, '//', window.location.host, window.location.pathname.replace(/\/*$/, '/').replace('/v2', '')].join('');
            this.state.roster = {}
            this.state.videoTileStates   = {}
            props.setup(base_url)
            return <div/>            
        }
        /**
         * For Setupped, in entrance
         */
        if(gs.status === AppStatus.IN_ENTRANCE){
            // show screen
            if(gs.status2 === AppStatus2.NONE){
                return(
                    <div  style={{ backgroundColor:bgColor, width: "100%",  height: "100%", top: 0, left: 0, }}>
                        <Entrance {...props}/>
                    </div>                
                )
            }else if(gs.status2 === AppStatus2.USER_CREATED){
                // User Created
                props.login(gs.userName, gs.code)
                return <div> executing... </div>
            }
        }

        /**
         * For Lobby or inMeeting
         */
        if(gs.status === AppStatus.IN_LOBBY || gs.status === AppStatus.IN_MEETING){
            return(
                <Lobby  {...props}/>
                // <div  style={{ backgroundColor:bgColor}}>
                // </div>                
            )
        }

        // /**
        //  * For Created Room
        //  */
        // if(gs.status === AppStatus.CREATED_MEETING_ROOM){
        //     const props      = this.props as any
        //     const gs         = this.props as GlobalState
        //     const baseURL    = gs.baseURL
        //     const roomId     = gs.joinInfo.Meeting.MeetingId
        //     const userName   = gs.userName
        //     const region     = gs.region
        //     props.enterSession(baseURL, roomId, userName, region)            
        //     //this.enterMeetingRoom()
        //     return <div/>
        // }
        // /**
        //  * For ENTERING_SESSION
        //  */
        // if(gs.status === AppStatus.ENTERING_SESSION){
        //     return <div/>
        // }

        // /**
        //  * For Select Device Screen
        //  */
        // if(gs.status === AppStatus.SELECT_DEVICE){
        //     // Create Meeting Session. To list devices, do this.
        //     if(gs.meetingSessionConf === null){
        //         const meetingSessionConf = new MeetingSessionConfiguration(gs.joinInfo.Meeting, gs.joinInfo.Attendee)
        //         const defaultMeetingSession = initializeMeetingSession(gs, meetingSessionConf)
    
        //         registerHandlers(this, props, defaultMeetingSession)
        //         const url = new URL(window.location.href);
        //         url.searchParams.set('m', gs.roomTitle);
        //         window.history.replaceState({}, `${gs.roomTitle}`, url.toString());
        //         props.initializedSession(meetingSessionConf, defaultMeetingSession)
        //         return <div/>
        //     }

        //     // List devices and load AI Model
        //     if(gs.inputAudioDevices === null){
        //         const audioInputDevicesPromise  = gs.meetingSession!.audioVideo.listAudioInputDevices()
        //         const videoInputDevicesPromise  = gs.meetingSession!.audioVideo.listVideoInputDevices()
        //         const videoInputResolutions     = ["360p", "540p", "720p"]
        //         const audioOutputDevicesPromise = gs.meetingSession!.audioVideo.listAudioOutputDevices()
        //             const netPromise = bodyPix.load();
    
        //         Promise.all([audioInputDevicesPromise, videoInputDevicesPromise, audioOutputDevicesPromise, netPromise]).then(([audioInputDevices, videoInputDevices, audioOutputDevices, bodyPix]) => {
        //             console.log("Promise:", videoInputDevices)
        //             this.state.bodyPix = bodyPix
        //             props.setDevices(audioInputDevices, videoInputDevices, videoInputResolutions, audioOutputDevices)
        //         })
        //         return <div/>
        //     }
        // }
    
        // /**
        //  * Apply the information in Global store to the class status.
        //  */
        // for(let attendeeId in this.state.roster){
        //     if(attendeeId in gs.storeRoster){
        //         const attendee = this.state.roster[attendeeId]
        //         attendee.name = gs.storeRoster[attendeeId].name
        //     }
        // }

        /**
         * render
         */
        // const bgColor="#324851"

        // return (
        //     <div  style={{ backgroundColor:bgColor, width: "100%",  height: "100%", top: 0, left: 0, }}>
        //         {(()=>{
        //             if(gs.status === AppStatus.LOGIN){
        //                 return <Entrance {...props}/>
        //             }else if(gs.status === AppStatus.SELECT_DEVICE){
        //                 return <SelectDevice {...props}  />
        //             }else if(gs.status === AppStatus.IN_MEETING_ROOM){
        //                 return <InMeetingRoom  {...props} videoTileState={this.state.videoTileStates} roster={this.state.roster} bodyPix={this.state.bodyPix}/>
        //             }
        //         })()}
        //     </div>
        // )
        return <div />
    }
}


export default App;