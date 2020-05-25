import * as React from 'react';
import { GlobalState } from '../reducers';
import { AppStatus, LOGGER_BATCH_SIZE, LOGGER_INTERVAL_MS, AppStatus2, AppMeetingStatus, AppLobbyStatus, NO_DEVICE_SELECTED } from '../const';
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
import { getDeviceLists, getVideoDevice } from './utils'
import { API_BASE_URL } from '../config';
import MainOverlayVideoElement from './meetingComp/MainOverlayVideoElement';


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
            `${API_BASE_URL}logs`,
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

export interface CurretnSettings {
    mute: boolean,
    videoEnable: boolean,
    speakerEnable: boolean,
    selectedInputAudioDevice          : string
    selectedInputVideoDevice          : string
    selectedInputVideoResolution      : string
    selectedOutputAudioDevice         : string
}

/**
 * 
 */
export interface AppState{
    videoTileStates : {[id:number]:VideoTileState}
    roster          : {[attendeeId:string]:Attendee}
    bodyPix         : bodyPix.BodyPix | null

    localVideoWidth  : number,
    localVideoHeight : number,
    inputVideoStream : MediaStream | null,
    inputVideoElement: HTMLVideoElement | null,
    inputVideoCanvas : HTMLCanvasElement | null,
    inputMaskCanvas  : HTMLCanvasElement | null,
    inputVideoCanvas2: HTMLCanvasElement | null,
    outputAudioElement: HTMLAudioElement | null,


    currentSettings   : CurretnSettings
}




/**
 * Main Component
 */
class App extends React.Component {
    // localVideoRef = React.createRef<HTMLVideoElement>()
    // audioRef = React.createRef<HTMLAudioElement>()
    // localVideoCanvasRef = React.createRef<HTMLCanvasElement>()
    // localVideoRef = React.createRef<HTMLVideoElement>()
    mainOverlayVideoRef = React.createRef<MainOverlayVideoElement>()

    state:AppState = {
        videoTileStates:{},
        roster:{},
        bodyPix : null,
        localVideoWidth: 0,
        localVideoHeight: 0,  
        inputVideoStream: null,
        inputVideoElement: null,
        inputVideoCanvas: null,
        inputMaskCanvas: null,
        inputVideoCanvas2: null,
        outputAudioElement: null,

        currentSettings:{
            mute: false,
            videoEnable: true,
            speakerEnable: true,
            selectedInputAudioDevice          : NO_DEVICE_SELECTED,
            selectedInputVideoDevice          : NO_DEVICE_SELECTED,
            selectedInputVideoResolution      : NO_DEVICE_SELECTED,
            selectedOutputAudioDevice         : NO_DEVICE_SELECTED,
        
        },
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
        console.log("updateVideoTileState",  this.state.videoTileStates)
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
            props.getAttendeeInformation(gs.joinInfo?.Meeting.MeetingId, attendeeId)
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


    ////////////////////////////////
    /// User Action
    ///////////////////////////////
    // For Microphone
    toggleMute = () => {
        const gs = this.props as GlobalState

        const mute = !this.state.currentSettings.mute
        const currentSettings = this.state.currentSettings
        currentSettings.mute = mute
        if(gs.meetingSession !== null){
            if (mute) {
                gs.meetingSession.audioVideo.realtimeMuteLocalAudio();
            } else {
                gs.meetingSession.audioVideo.realtimeUnmuteLocalAudio();
            }
        }
        this.setState({currentSettings:currentSettings})
    }

    selectInputAudioDevice = (deviceId: string) => {
        const gs = this.props as GlobalState
        const currentSettings = this.state.currentSettings
        currentSettings.selectedInputAudioDevice = deviceId

        if(gs.meetingSession !== null){
            gs.meetingSession.audioVideo.chooseAudioInputDevice(deviceId)
        }
        this.setState({currentSettings:currentSettings})
    }

    // For Camera
    toggleVideo = () => {
        const gs = this.props as GlobalState
        const videoEnable = !this.state.currentSettings.videoEnable
        const currentSettings = this.state.currentSettings
        currentSettings.videoEnable = videoEnable
        this.setState({currentSettings:currentSettings})
    }

    selectInputVideoDevice = (deviceId: string) => {
        const gs = this.props as GlobalState
        const props = this.props as any


        getVideoDevice(deviceId).then(stream => {
            if (stream !== null) {
                this.state.localVideoWidth = stream.getVideoTracks()[0].getSettings().width ? stream.getVideoTracks()[0].getSettings().width! : 0
                this.state.localVideoHeight = stream.getVideoTracks()[0].getSettings().height ? stream.getVideoTracks()[0].getSettings().height! : 0
                // this.localVideoRef.current!.srcObject = stream;
                this.state.inputVideoStream = stream
                // return new Promise((resolve, reject) => {
                //     this.localVideoRef.current!.onloadedmetadata = () => {
                //         resolve();
                //     };
                // });
            }
        });

        const currentSettings = this.state.currentSettings
        currentSettings.selectedInputVideoDevice = deviceId
        this.setState({currentSettings:currentSettings})
    }


    // For Speaker
    toggleSpeaker = () => {
        const gs = this.props as GlobalState
        const props = this.props as any

        const speakerEnable = !this.state.currentSettings.speakerEnable
        if(gs.meetingSession !== null){
            if (this.state.currentSettings.speakerEnable) {
                gs.meetingSession!.audioVideo.bindAudioElement(this.state.outputAudioElement!)
            } else {
                gs.meetingSession!.audioVideo.unbindAudioElement();
            }
        }

        const currentSettings = this.state.currentSettings
        currentSettings.speakerEnable = speakerEnable
        this.setState({currentSettings:currentSettings})
    }

    selectOutputAudioDevice = (deviceId: string) => {
        const gs = this.props as GlobalState
        const props = this.props as any
        if(gs.meetingSession !==null){
            gs.meetingSession!.audioVideo.chooseAudioOutputDevice(deviceId)
        }
        const currentSettings = this.state.currentSettings
        currentSettings.selectedOutputAudioDevice = deviceId
        this.setState({currentSettings:currentSettings})
    }



    callbacks:{[key:string]:any} = {
        toggleMute: this.toggleMute,
        selectInputAudioDevice: this.selectInputAudioDevice,
        toggleVideo: this.toggleVideo,
        selectInputVideoDevice: this.selectInputVideoDevice,
        toggleSpeaker: this.toggleSpeaker,
        selectOutputAudioDevice: this.selectOutputAudioDevice,
    }


    componentDidMount() {
        const localVideoElement = document.createElement("video")
        localVideoElement.play()
        const localAudioElement = document.createElement("audio")
        const localVideoCanvas = document.createElement("canvas")

        this.setState({
            inputVideoElement:localVideoElement,
            outputAudioElement: localAudioElement,
            inputVideoCanvas: localVideoCanvas,
        })
        requestAnimationFrame(() => this.drawVideoCanvas())
    }


    drawVideoCanvas = () => {
        if(this.state.inputVideoStream!==null){
            const videoStream = this.state.inputVideoStream
            const width  = videoStream.getVideoTracks()[0].getSettings().width 
            const height = videoStream.getVideoTracks()[0].getSettings().height
            this.state.inputVideoCanvas!.width = width!
            this.state.inputVideoCanvas!.height = height!
            const ctx = this.state.inputVideoCanvas!.getContext("2d")!
            ctx.drawImage(this.state.inputVideoElement!, 0, 0)
        }
        requestAnimationFrame(() => this.drawVideoCanvas())
    }

    render() {
        const gs = this.props as GlobalState
        const props = this.props as any
        const bgColor="#eeeeee"
        for(let key in this.callbacks){
            props[key] = this.callbacks[key]
        }
        /**
         * For initialization
         */
        if(gs.status === AppStatus.STARTED){
            const base_url: string = [window.location.protocol, '//', window.location.host, window.location.pathname.replace(/\/*$/, '/').replace('/v2', '')].join('');
            this.state.roster = {}
            this.state.videoTileStates   = {}
            props.setup(base_url)
            return <div/>            
        }
        /**
         * For Entrance
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
         * For Lobby
         */
        if(gs.status === AppStatus.IN_LOBBY){
            if(gs.lobbyStatus === AppLobbyStatus.WILL_PREPARE){
                const deviceListPromise     = getDeviceLists()
                const netPromise = bodyPix.load();

                Promise.all([deviceListPromise, netPromise]).then(([deviceList,bodyPix])=>{
                    const audioInputDevices     = deviceList['audioinput']
                    const videoInputDevices     = deviceList['videoinput']
                    const audioOutputDevices    = deviceList['audiooutput']
                    const inputVideoResolutions = ["360p", "540p", "720p"]
                    this.state.bodyPix = bodyPix

                    const currentSettings = this.state.currentSettings
                    currentSettings.selectedInputAudioDevice      = audioInputDevices![0]     ? audioInputDevices![0]['deviceId']     : NO_DEVICE_SELECTED
                    currentSettings.selectedInputVideoDevice      = videoInputDevices![0]     ? videoInputDevices![0]['deviceId']     : NO_DEVICE_SELECTED
                    currentSettings.selectedInputVideoResolution  = inputVideoResolutions![0] ? inputVideoResolutions![0]             : NO_DEVICE_SELECTED
                    currentSettings.selectedOutputAudioDevice     = audioOutputDevices![0]    ? audioOutputDevices![0]['deviceId']    : NO_DEVICE_SELECTED
                    props.setDevices(audioInputDevices, videoInputDevices, audioOutputDevices)
                    props.refreshRoomList()

                    getVideoDevice(currentSettings.selectedInputVideoDevice).then(stream => {

                        if (stream !== null) {
                            this.state.inputVideoElement!.srcObject = stream

                            this.setState({
                                inputVideoStream: stream,
                                currentSettings:currentSettings
                            })
                        }
                    })
                })
                return (
                    <div/>
                )
            }else{
                return(
                    <div>
                        <Lobby  {...props} appState={this.state}/>
                    </div>
                )
            }
        }


        /**
         * Meeting Setup
         */
        if(gs.status === AppStatus.IN_MEETING){
            if(gs.meetingStatus === AppMeetingStatus.WILL_PREPARE){
                if(gs.meetingSession!==null){
                    gs.meetingSession.audioVideo.stopLocalVideoTile()
                    gs.meetingSession.audioVideo.unbindAudioElement()
                    for(let key in this.state.videoTileStates){
                        gs.meetingSession.audioVideo.unbindVideoElement(Number(key))
                    }
                    gs.meetingSession.audioVideo.stop()
                    
                    this.state.videoTileStates = {}
                    props.initializedSession(null, null)
                }else{
                    const meetingSessionConf = new MeetingSessionConfiguration(gs.joinInfo!.Meeting, gs.joinInfo!.Attendee)
                    const defaultMeetingSession = initializeMeetingSession(gs, meetingSessionConf)
                    registerHandlers(this, props, defaultMeetingSession)
                    // const url = new URL(window.location.href);
                    // url.searchParams.set('m', gs.roomTitle);
                    // window.history.replaceState({}, `${gs.roomTitle}`, url.toString());

                    // @ts-ignore
                    const mediaStream = this.state.inputVideoCanvas.captureStream()
                    console.log("MS", mediaStream)
                    const auidoInputPromise = defaultMeetingSession.audioVideo.chooseAudioInputDevice(this.state.currentSettings.selectedInputAudioDevice)
                    const auidooutputPromise = defaultMeetingSession.audioVideo.chooseAudioOutputDevice(this.state.currentSettings.selectedOutputAudioDevice)
                    const videoInputPromise = defaultMeetingSession.audioVideo.chooseVideoInputDevice(mediaStream)
                    
                    Promise.all([auidoInputPromise, auidooutputPromise, videoInputPromise]).then(()=>{
                        defaultMeetingSession.audioVideo.bindAudioElement(this.state.outputAudioElement!)
                        defaultMeetingSession.audioVideo.start()
                            if (this.state.currentSettings.mute) {
                            defaultMeetingSession.audioVideo.realtimeMuteLocalAudio();
                        } else {
                            defaultMeetingSession.audioVideo.realtimeUnmuteLocalAudio();
                        }
                        if (this.state.currentSettings.speakerEnable) {
                            defaultMeetingSession.audioVideo.bindAudioElement(this.state.outputAudioElement!)
                        } else {
                            defaultMeetingSession.audioVideo.unbindAudioElement();
                        }
                        console.log("start local video1")
                        defaultMeetingSession.audioVideo.startLocalVideoTile()
                        console.log("start local video2")
                        props.initializedSession(meetingSessionConf, defaultMeetingSession)
        
                    })
                }

                return <div/>
            }

            return(
                <div>
                    <Lobby  {...props}  appState={this.state}/>

                </div>
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