import * as React from 'react';
import { GlobalState } from '../reducers';
import { AppStatus, LOGGER_BATCH_SIZE, LOGGER_INTERVAL_MS, AppEntranceStatus, AppMeetingStatus, AppLobbyStatus, NO_DEVICE_SELECTED, LocalVideoConfigs } from '../const';
import * as bodyPix from '@tensorflow-models/body-pix';

import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration,
    Logger,
    MeetingSessionPOSTLogger,
    VideoTileState,
    DataMessage
} from 'amazon-chime-sdk-js';
import Entrance from './Entrance';
import Lobby from './Lobby';
import DeviceChangeObserverImpl from './DeviceChangeObserverImpl';
import AudioVideoObserverImpl from './AudioVideoObserverImpl';
import ContentShareObserverImpl from './ContentShareObserverImpl';
import { setRealtimeSubscribeToAttendeeIdPresence, setSubscribeToActiveSpeakerDetector, setRealtimeSubscribeToReceiveDataMessage } from './subscribers';
import { getDeviceLists, getTileId } from './utils'
import { API_BASE_URL } from '../config';
import { RS_STAMPS } from './resources';
import ErrorPortal from './meetingComp/ErrorPortal';
import { saveFile, RecievingStatus, SendingStatus } from './WebsocketApps/FileTransfer';
import {  WSMessageType } from './WebsocketApps/const';
import {  WSStamp } from './WebsocketApps/Stamp';
import { WSText } from './WebsocketApps/Text';
import { sendStampBySignal } from './WebsocketApps/StampBySignal';
import { sendDrawingBySignal, DrawingType, WSDrawing } from './WebsocketApps/DrawingBySignal'
import { WebsocketApps } from './WebsocketApps/WebsocketApps'
import { LocalVideoEffectors } from './LocalVideoEffectors/LocalVideoEffectors';

/**
 * 
 * @param meetingSessionConf 
 */
const initializeMeetingSession = (gs: GlobalState, meetingSessionConf: MeetingSessionConfiguration): DefaultMeetingSession => {

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
const registerHandlers = (app: App, props: any, meetingSession: DefaultMeetingSession) => {
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
    setRealtimeSubscribeToReceiveDataMessage(app, meetingSession.audioVideo, WSMessageType.Drawing)
    setRealtimeSubscribeToReceiveDataMessage(app, meetingSession.audioVideo, WSMessageType.Stamp)
    setRealtimeSubscribeToReceiveDataMessage(app, meetingSession.audioVideo, WSMessageType.Text)

}

let dataMessageConsumers:any[] = []
export const addDataMessageConsumers = (consumer:any) =>{
    dataMessageConsumers.push(consumer)
}
export const removeDataMessageConsumers = (consumer:any) =>{
    dataMessageConsumers = dataMessageConsumers.filter(n => n !== consumer)
}

/**
 * 
 */
export interface Attendee {
    attendeeId: string
    name: string | null
    active: boolean
    volume: number
    muted: boolean
    paused: boolean
    signalStrength: number
}

export interface CurrentSettings {
    mute: boolean,
    videoEnable: boolean,
    speakerEnable: boolean,
    selectedInputAudioDevice: string
    selectedInputVideoDevice: string
    selectedInputVideoResolution: string
    selectedOutputAudioDevice: string
    focuseAttendeeId: string
    globalStamps: (WSStamp|WSText)[]

    selectedInputVideoDevice2: string

}

/**
 * 
 */
export interface AppState {
    videoTileStates: { [id: number]: VideoTileState }
    roster: { [attendeeId: string]: Attendee }

    messagingSocket: WebsocketApps | null,
    stamps: { [key: string]: HTMLImageElement },
    outputAudioElement: HTMLAudioElement | null,
    shareVideoElement: HTMLVideoElement,
    
    currentSettings: CurrentSettings,
    localVideoEffectors: LocalVideoEffectors,
}

/**
 * Main Component
 */
class App extends React.Component {

    state: AppState = {
        videoTileStates: {},
        roster: {},
        messagingSocket: null,
        stamps: {},
        outputAudioElement: document.createElement("audio"),

        shareVideoElement: document.createElement("video"),


        currentSettings: {
            mute: false,
            videoEnable: true,
            speakerEnable: true,
            selectedInputAudioDevice: NO_DEVICE_SELECTED,
            selectedInputVideoDevice: NO_DEVICE_SELECTED,
//            selectedInputVideoResolution: "vc720p",
            selectedInputVideoResolution: "vc180p3",
            selectedOutputAudioDevice: NO_DEVICE_SELECTED,
            focuseAttendeeId: "",
            globalStamps: [],

            selectedInputVideoDevice2: NO_DEVICE_SELECTED,
        },
        localVideoEffectors : new LocalVideoEffectors()
    }


    /***************************
    *  Callback for tile change
    ****************************/
    updateVideoTileState = (state: VideoTileState) => {
        let needUpdate = false
        const videoTileStates = this.state.videoTileStates
        if (videoTileStates[state.tileId!]) {
        } else {
            needUpdate = true
        }
        videoTileStates[state.tileId!] = state
        if (needUpdate) {
            this.setState({videoTileStates:videoTileStates})
        }
        console.log("updateVideoTileState ", state.tileId!)
        console.log("updateVideoTileState", this.state.videoTileStates)
    }
    removeVideoTileState = (tileId: number) => {
        delete this.state.videoTileStates[tileId]
        this.setState({})
        console.log("removeVideoTileState ", tileId)

    }
    /***************************
    *  Callback for attendee change
    ****************************/
    deleteAttendee = (attendeeId: string) => {
        console.log("deleteAttendee")
        delete this.state.roster[attendeeId]
        this.setState({})
    }
    changeAttendeeStatus = (attendeeId: string, volume: number | null, muted: boolean | null, signalStrength: number | null) => {
        // console.log("changeAttendeeStatus", attendeeId)
        const props = this.props as any
        const gs = this.props as GlobalState
        const roster = this.state.roster
        if ((attendeeId in roster) === false) {
            roster[attendeeId] = {
                attendeeId: attendeeId,
                name: null,
                active: false,
                volume: 0,
                muted: false,
                paused: false,
                signalStrength: 0
            }
        }
        

        if (volume !== null) {
            roster[attendeeId].volume = volume
        }
        if (muted !== null) {
            roster[attendeeId].muted = muted
        }
        if (signalStrength !== null) {
            roster[attendeeId].signalStrength = signalStrength
        }
        if (this.state.roster[attendeeId].name === null || this.state.roster[attendeeId].name === "Unknown") { // ChimeがUnknownで返すときがある
            props.getAttendeeInformation(gs.joinInfo?.Meeting.MeetingId, attendeeId)
        }
        this.setState({})
    }
    changeActiveSpeaker = (attendeeId: string) => {
        //console.log("changeActiveSpeaker")
        // const props = this.props as any
        //props.changeActiveSpeaker(attendeeId)
    }
    updateActiveScore = (scores: { [attendeeId: string]: number }) => {
        // const props = this.props as any
        //console.log("updateActiveScore")
        //props.updateActiveScore(scores)
    }
    /***************************
    *  Callback for DataMessage
    ****************************/
    receivedDataMessage = (dataMessage: DataMessage) =>{
        if(dataMessage.topic === WSMessageType.Text){

        }else if(dataMessage.topic === WSMessageType.Stamp){
            const json = JSON.parse(Buffer.from(dataMessage.data).toString())
            const stamp = json.content as WSStamp
            this.state.currentSettings.globalStamps.push(stamp)

        }else if(dataMessage.topic === WSMessageType.Drawing){
            const json = JSON.parse(Buffer.from(dataMessage.data).toString())
            const data = json.content as WSDrawing
            console.log(data)
            dataMessageConsumers.map(consumer =>{
                if(data.mode === DrawingType.Draw){
                    consumer.draw(data.startXR, data.startYR, data.endXR, data.endYR, data.stroke, data.lineWidth, true)
                }else if(data.mode === DrawingType.Erase){
                    consumer.erase(data.startXR, data.startYR, data.endXR, data.endYR, true)
                }else if(data.mode === DrawingType.Clear){
                    consumer.clearDrawing()
                }else{
                    console.log("CMD3",data.mode, DrawingType.Erase.toString())
                }
                return ""
            })
        }
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
        if (gs.meetingSession !== null) {
            if (mute) {
                gs.meetingSession.audioVideo.realtimeMuteLocalAudio();
            } else {
                gs.meetingSession.audioVideo.realtimeUnmuteLocalAudio();
            }
        }
        this.setState({ currentSettings: currentSettings })
    }

    selectInputAudioDevice = (deviceId: string) => {
        const gs = this.props as GlobalState
        const currentSettings = this.state.currentSettings
        currentSettings.selectedInputAudioDevice = deviceId

        if (gs.meetingSession !== null) {
            gs.meetingSession.audioVideo.chooseAudioInputDevice(deviceId)
        }
        this.setState({ currentSettings: currentSettings })
    }

    // For Camera
    toggleVideo = () => {
        const gs = this.props as GlobalState
        const videoEnable = !this.state.currentSettings.videoEnable
        const currentSettings = this.state.currentSettings
        currentSettings.videoEnable = videoEnable
        const localVideoEffectors = this.state.localVideoEffectors
        localVideoEffectors.cameraEnabled=videoEnable
        this.setState({ currentSettings: currentSettings, localVideoEffectors:localVideoEffectors})
        if (videoEnable) {
            this.selectInputVideoDevice(currentSettings.selectedInputVideoDevice)
        } else {
            //gs.meetingSession!.audioVideo.chooseVideoInputDevice(null)
            this.state.localVideoEffectors.stopInputMediaStream()
            gs.meetingSession?.audioVideo.stopLocalVideoTile()
        }
    }

    selectInputVideoDevice = (deviceId: string) => {
        console.log("SELECT INPUTDEVICE", deviceId)
        const gs = this.props as GlobalState
        const videoInputPromise = gs.meetingSession?.audioVideo.chooseVideoInputDevice(null)
        const localVideoEffectorsPromise = this.state.localVideoEffectors.selectInputVideoDevice(deviceId)

        Promise.all([videoInputPromise, localVideoEffectorsPromise]).then(()=>{
            const mediaStream = this.state.localVideoEffectors.getMediaStream()
            gs.meetingSession?.audioVideo.chooseVideoInputDevice(mediaStream).then(()=>{
                gs.meetingSession!.audioVideo.startLocalVideoTile()
            })
        })
        const currentSettings = this.state.currentSettings
        currentSettings.selectedInputVideoDevice = deviceId
        this.setState({ currentSettings: currentSettings })
    }

    selectInputVideoDevice2 = (deviceId: string) => {
        const currentSettings = this.state.currentSettings
        currentSettings.selectedInputVideoDevice2 = deviceId
        this.setState({ currentSettings: currentSettings })
    }    

    // For Speaker
    toggleSpeaker = () => {
        const gs = this.props as GlobalState

        const speakerEnable = !this.state.currentSettings.speakerEnable
        if (gs.meetingSession !== null) {
            if (speakerEnable) {
                gs.meetingSession!.audioVideo.bindAudioElement(this.state.outputAudioElement!)
            } else {
                gs.meetingSession!.audioVideo.unbindAudioElement();
            }
        }

        const currentSettings = this.state.currentSettings
        currentSettings.speakerEnable = speakerEnable
        this.setState({ currentSettings: currentSettings })
    }

    selectOutputAudioDevice = (deviceId: string) => {
        const gs = this.props as GlobalState
        if (gs.meetingSession !== null) {
            gs.meetingSession!.audioVideo.chooseAudioOutputDevice(deviceId)
        }
        const currentSettings = this.state.currentSettings
        currentSettings.selectedOutputAudioDevice = deviceId
        this.setState({ currentSettings: currentSettings })
    }

    // For SharedVideo
    sharedVideoSelected = (e: any) => {
        const gs = this.props as GlobalState
        const path = URL.createObjectURL(e.target.files[0]);

        try {
            gs.meetingSession!.audioVideo.stopContentShare()
            this.state.shareVideoElement.pause()

        } catch (e) {
        }
        const videoElement = this.state.shareVideoElement
        videoElement.src = path
        videoElement.play()

        setTimeout(
            async () => {
                // @ts-ignore
                const mediaStream: MediaStream = await this.state.shareVideoElement.captureStream()
                await gs.meetingSession!.audioVideo.startContentShare(mediaStream)
                videoElement.currentTime = 0
                videoElement.pause()
                this.setState({shareVideoElement: videoElement})
            }
            , 5000); // I don't know but we need some seconds to restart video share....
    }

    playSharedVideo = () => {
        this.state.shareVideoElement.play()
    }
    pauseSharedVideo = () => {
        this.state.shareVideoElement.pause()
    }
    stopSharedVideo = () => {
        const gs = this.props as GlobalState
        gs.meetingSession!.audioVideo.stopContentShare()
    }
    // For SharedDisplay
    sharedDisplaySelected = () => {
        const gs = this.props as GlobalState
        //gs.meetingSession!.audioVideo.startContentShareFromScreenCapture()
        const streamConstraints = {
            frameRate: {
                max: 15,
            },
        }
        // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
        navigator.mediaDevices.getDisplayMedia(streamConstraints).then(media => {
            gs.meetingSession!.audioVideo.startContentShare(media)
        })
    }
    stopSharedDisplay = () => {
        const gs = this.props as GlobalState
        gs.meetingSession!.audioVideo.stopContentShare()
    }

    // For Config
    setVirtualBackground = (imgPath: string) => {
        console.log("SetVirtual", imgPath) 
        const localVideoEffectors = this.state.localVideoEffectors
        localVideoEffectors.virtualBackgroundImagePath = imgPath
        if(imgPath === "/resources/vbg/pic0.jpg"){
            localVideoEffectors.virtualBackgroundEnabled   = false
        }else{
            localVideoEffectors.virtualBackgroundEnabled   = true
        }
        this.setState({ localVideoEffectors:localVideoEffectors })
    }

    selectInputVideoResolution = (value: string) =>{
        const gs = this.props as GlobalState

        const videoConfig = LocalVideoConfigs[value]
        //console.log(videoConfig)
        gs.meetingSession!.audioVideo.chooseVideoInputQuality(videoConfig.width, videoConfig.height, videoConfig.frameRate, videoConfig.maxBandwidthKbps);

        const currentSettings = this.state.currentSettings
        currentSettings.selectedInputVideoResolution = value
        const localVideoEffectors = this.state.localVideoEffectors
        localVideoEffectors.outputResolutionKey = value
        this.setState({ currentSettings: currentSettings, localVideoEffectors:localVideoEffectors })

        const videoEnable = this.state.currentSettings.videoEnable
        if (videoEnable) {
            this.selectInputVideoDevice(currentSettings.selectedInputVideoDevice)
        }         
    }

    // For TileView Control
    setFocusedAttendee = (attendeeId: string) => {
        const gs = this.props as GlobalState
        console.log("focus:", this.state.currentSettings.focuseAttendeeId)
        if(attendeeId === gs.joinInfo?.Attendee.AttendeeId && this.state.currentSettings.videoEnable === false){
            console.log("local video is off")
            return
        }
        const currentSettings = this.state.currentSettings
        currentSettings.focuseAttendeeId = attendeeId
        this.setState({ currentSettings: currentSettings })
    }
    
    pauseVideoTile = (attendeeId:string) =>{
        const gs = this.props as GlobalState
        const tileId = getTileId(attendeeId, this.state.videoTileStates)
        if(tileId >= 0){
            gs.meetingSession!.audioVideo.pauseVideoTile(tileId)
            const roster = this.state.roster
            roster[attendeeId].paused = true
            this.setState({roster:roster})
        }else{
            console.log("There is no tile: ", tileId, attendeeId)
        }
    }
    unpauseVideoTile = (attendeeId:string) =>{
        const gs = this.props as GlobalState
        const tileId = getTileId(attendeeId, this.state.videoTileStates)
        if(tileId >= 0){
            gs.meetingSession!.audioVideo.unpauseVideoTile(tileId)
            const roster = this.state.roster
            roster[attendeeId].paused = false
            this.setState({roster:roster})
        }else{
            console.log("There is no tile: ", tileId, attendeeId)
        }
    }


    // For Messaging
    sendStamp = (targetId: string, imgPath: string) => {
        this.state.messagingSocket!.sendStamp(targetId, imgPath)
    }

    sendStampBySignal = (targetId: string, imgPath: string) => {
        const gs = this.props as GlobalState
        sendStampBySignal(gs.meetingSession!.audioVideo, targetId, imgPath, false)
    }

    sendText = (targetId: string, text: string) => {
        this.state.messagingSocket!.sendText(targetId, text)
    }

    sendDrawingBySignal = (targetId: string, mode:string, startXR:number, startYR:number, endXR:number, endYR:number, stroke:string, lineWidth:number)=>{
        const gs = this.props as GlobalState
        sendDrawingBySignal(gs.meetingSession!.audioVideo, targetId, mode, startXR, startYR, endXR, endYR, stroke, lineWidth, false)
    }

    // For File Share
    sharedFileSelected = (targetId:string, e: any) => {
        this.state.messagingSocket!.startFileTransfer(targetId, e)
    }

    callbacks: { [key: string]: any } = {
        toggleMute: this.toggleMute,
        selectInputAudioDevice: this.selectInputAudioDevice,
        toggleVideo: this.toggleVideo,
        selectInputVideoDevice: this.selectInputVideoDevice,
        toggleSpeaker: this.toggleSpeaker,
        selectOutputAudioDevice: this.selectOutputAudioDevice,
        selectInputVideoResolution: this.selectInputVideoResolution,
        sharedVideoSelected: this.sharedVideoSelected,
        playSharedVideo: this.playSharedVideo,
        pauseSharedVideo: this.pauseSharedVideo,
        stopSharedVideo:  this.stopSharedVideo,
        sharedDisplaySelected: this.sharedDisplaySelected,
        stopSharedDisplay: this.stopSharedDisplay,
        setVirtualBackground: this.setVirtualBackground,
        setFocusedAttendee: this.setFocusedAttendee,
        pauseVideoTile: this.pauseVideoTile,
        unpauseVideoTile: this.unpauseVideoTile,
        sendStamp: this.sendStamp,
        sendText: this.sendText,

        // addMessagingConsumer: this.addMessagingConsumer,
        selectInputVideoDevice2: this.selectInputVideoDevice2,
        sendStampBySignal: this.sendStampBySignal,
        sendDrawingBySignal: this.sendDrawingBySignal,
        sharedFileSelected: this.sharedFileSelected,
    }


    componentDidMount() {
        requestAnimationFrame(() => this.drawVideoCanvas())
    }


    drawVideoCanvas = () => {
        this.state.localVideoEffectors.doEffect()
        requestAnimationFrame(() => this.drawVideoCanvas())
    }




    render() {
        const gs = this.props as GlobalState
        const props = this.props as any
        const bgColor = "#eeeeee"
        for (let key in this.callbacks) {
            props[key] = this.callbacks[key]
        }

        if(gs.showError === true){
            return <ErrorPortal {...props}/>
        }

        /**
         * For Started
         */
        if (gs.status === AppStatus.STARTED) {
            const base_url: string = [window.location.protocol, '//', window.location.host, window.location.pathname.replace(/\/*$/, '/').replace('/v2', '')].join('');
            this.setState({
                roster          : {},
                videoTileStates : {},
            })
            props.goEntrance(base_url)
            return <div />
        }
        /**
         * For Entrance
         */
        if (gs.status === AppStatus.IN_ENTRANCE) {
            // show screen
            if (gs.entranceStatus === AppEntranceStatus.NONE) {
                return (
                    <div style={{ backgroundColor: bgColor, width: "100%", height: "100%", top: 0, left: 0, }}>
                        <Entrance {...props} />
                    </div>
                )
            } else if (gs.entranceStatus === AppEntranceStatus.USER_CREATED) {
                // User Created
                props.login(gs.userName, gs.code)
                return <div> executing... </div>
            }
        }

        /**
         * For Lobby
         */
        if (gs.status === AppStatus.IN_LOBBY) {
            if (gs.lobbyStatus === AppLobbyStatus.WILL_PREPARE) {
                const deviceListPromise = getDeviceLists()
//                const netPromise = bodyPix.load();

                // Load Stamps
                const RS_STAMPS_sorted = RS_STAMPS.sort()
                const stamps: { [key: string]: HTMLImageElement } ={}
                for (const i in RS_STAMPS_sorted) {
                    const imgPath = RS_STAMPS_sorted[i]
                    const image = new Image()
                    image.src = imgPath
                    image.onload = () => {
                        stamps[imgPath] = image
                    }
                }


                Promise.all([deviceListPromise]).then(([deviceList]) => {
                    const audioInputDevices = deviceList['audioinput']
                    const videoInputDevices = deviceList['videoinput']
                    const audioOutputDevices = deviceList['audiooutput']
                    this.setState({stamps:stamps})

                    const currentSettings = this.state.currentSettings
                    currentSettings.selectedInputAudioDevice = audioInputDevices![0] ? audioInputDevices![0]['deviceId'] : NO_DEVICE_SELECTED
                    currentSettings.selectedInputVideoDevice = videoInputDevices![0] ? videoInputDevices![0]['deviceId'] : NO_DEVICE_SELECTED
                    currentSettings.selectedOutputAudioDevice = audioOutputDevices![0] ? audioOutputDevices![0]['deviceId'] : NO_DEVICE_SELECTED
                    props.lobbyPrepared(audioInputDevices, videoInputDevices, audioOutputDevices)
                    props.refreshRoomList()
                    this.state.localVideoEffectors.selectInputVideoDevice(currentSettings.selectedInputVideoDevice)
                })
                return (
                    <div />
                )
            } else {
                return (
                    <div>
                        <Lobby  {...props} appState={this.state} />
                    </div>
                )
            }
        }


        /**
         * Meeting Setup
         */
        if (gs.status === AppStatus.IN_MEETING) {
            if (gs.meetingStatus === AppMeetingStatus.WILL_PREPARE) {
                // If session exist already, it'll be initialized.
                const meetingSessionConf = new MeetingSessionConfiguration(gs.joinInfo!.Meeting, gs.joinInfo!.Attendee)
                const defaultMeetingSession = initializeMeetingSession(gs, meetingSessionConf)
                registerHandlers(this, props, defaultMeetingSession)
                // const url = new URL(window.location.href);
                // url.searchParams.set('m', gs.roomTitle);
                // window.history.replaceState({}, `${gs.roomTitle}`, url.toString());

                const messagingSocket = new WebsocketApps(
                    defaultMeetingSession.configuration.meetingId!,
                    defaultMeetingSession.configuration.credentials!.attendeeId!,
                    defaultMeetingSession.configuration.credentials!.joinToken!
                )
                const messagingSocketPromise = messagingSocket.open()



                const mediaStream = this.state.localVideoEffectors.getMediaStream()
                console.log("MS", mediaStream)
                const auidoInputPromise  = defaultMeetingSession.audioVideo.chooseAudioInputDevice(this.state.currentSettings.selectedInputAudioDevice)
                const auidooutputPromise = defaultMeetingSession.audioVideo.chooseAudioOutputDevice(this.state.currentSettings.selectedOutputAudioDevice)
                const videoInputPromise  = defaultMeetingSession.audioVideo.chooseVideoInputDevice(mediaStream)

                Promise.all([auidoInputPromise, auidooutputPromise, videoInputPromise, messagingSocketPromise]).then(() => {
                    // Initializing for meeting
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
                    defaultMeetingSession.audioVideo.startLocalVideoTile()
                    props.meetingPrepared(meetingSessionConf, defaultMeetingSession)

                    // Set WebsocketApps Event
                    messagingSocket.addFileRecievingEventListener((e:RecievingStatus)=>{
                        if(e.available===true){
                            saveFile(e.uuid)
                        }
                        console.log(`File Recieving...: ${e.recievedIndex}/${e.partNum}`)
                    })
                    messagingSocket.addFileSendingEventListener((e:SendingStatus)=>{
                        console.log(`File Transfering...: ${e.transferredIndex}/${e.partNum}`)
                    })
                    messagingSocket.addStampEventListener((e:WSStamp)=>{
                        this.state.currentSettings.globalStamps.push(e)
                    })
                    messagingSocket.addTextEventListener((e:WSText)=>{
                        this.state.currentSettings.globalStamps.push(e)
                    })

                    this.setState({messagingSocket: messagingSocket})
                })
                return <div />
            } else if (gs.meetingStatus === AppMeetingStatus.WILL_CLEAR) {
                // Just left meeting. post process
                if (gs.meetingSession !== null) {
                    gs.meetingSession.audioVideo.stopLocalVideoTile()
                    gs.meetingSession.audioVideo.unbindAudioElement()
                    for (let key in this.state.videoTileStates) {
                        gs.meetingSession.audioVideo.unbindVideoElement(Number(key))
                    }
                    gs.meetingSession.audioVideo.stop()
                    this.setState({
                        videoTileStates   : {},
                        roster            : {},
                        messagingConsumer : {},
                    })
                    props.clearedMeetingSession()
                }
            }

            for (let attendeeId in this.state.roster) {
                if (attendeeId in gs.storeRoster) {
                    const attendee = this.state.roster[attendeeId]
                    attendee.name = gs.storeRoster[attendeeId].name
                }
            }
            return (
                <div>
                    <Lobby  {...props} appState={this.state} />
                </div>
            )
        }
        return <div />
    }
}


export default App;