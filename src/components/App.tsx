import * as React from 'react';
import { GlobalState } from '../reducers';
import { AppStatus, LOGGER_BATCH_SIZE, LOGGER_INTERVAL_MS, AppEntranceStatus, AppMeetingStatus, AppLobbyStatus, NO_DEVICE_SELECTED } from '../const';
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
    ReconnectingPromisedWebSocket,
    DefaultPromisedWebSocketFactory,
    DefaultDOMWebSocketFactory,
    FullJitterBackoff,
    DataMessage
} from 'amazon-chime-sdk-js';
import Entrance from './Entrance';
import Lobby from './Lobby';
import DeviceChangeObserverImpl from './DeviceChangeObserverImpl';
import AudioVideoObserverImpl from './AudioVideoObserverImpl';
import ContentShareObserverImpl from './ContentShareObserverImpl';
import { setRealtimeSubscribeToAttendeeIdPresence, setSubscribeToActiveSpeakerDetector, setRealtimeSubscribeToReceiveDataMessage } from './subscribers';
import { getDeviceLists, getVideoDevice } from './utils'
import { API_BASE_URL, MESSAGING_URL } from '../config';
import { RS_STAMPS } from './resources';
import ErrorPortal from './meetingComp/ErrorPortal';


export enum MessageType {
    Message,
    Stamp,
    Drawing,
}

export enum DrawingType {
    Draw,
    Erase,
    Clear,
}

interface Message {
    type: MessageType
    startTime: number
    targetId: string
    imgSrc: string
    message: string
}

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
    setRealtimeSubscribeToReceiveDataMessage(app, meetingSession.audioVideo, MessageType.Drawing.toString())
    setRealtimeSubscribeToReceiveDataMessage(app, meetingSession.audioVideo, MessageType.Stamp.toString())
    setRealtimeSubscribeToReceiveDataMessage(app, meetingSession.audioVideo, MessageType.Message.toString())

}

let dataMessageConsumers:any[] = []
export const addDataMessageConsumers = (consumer:any) =>{
    console.log("ADD CONSUMER")
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
    volume: number | null
    muted: boolean | null
    signalStrength: number | null
}

export interface CurrentSettings {
    mute: boolean,
    videoEnable: boolean,
    speakerEnable: boolean,
    selectedInputAudioDevice: string
    selectedInputVideoDevice: string
    selectedInputVideoResolution: string
    selectedOutputAudioDevice: string
    virtualBackgroundPath: string
    focuseAttendeeId: string
    globalMessages: Message[]

    selectedInputVideoDevice2: string

}

/**
 * 
 */
export interface AppState {
    videoTileStates: { [id: number]: VideoTileState }
    roster: { [attendeeId: string]: Attendee }
    bodyPix: bodyPix.BodyPix | null
    messagingSocket: ReconnectingPromisedWebSocket | null,
    stamps: { [key: string]: HTMLImageElement },
    messagingConsumer: (()=>{})[]

    outputAudioElement: HTMLAudioElement | null,

    inputVideoStream: MediaStream | null,
    inputVideoElement: HTMLVideoElement,
    inputVideoCanvas: HTMLCanvasElement,
    inputMaskCanvas: HTMLCanvasElement,
    virtualBGImage: HTMLImageElement,
    virtualBGCanvas: HTMLCanvasElement,
    inputVideoCanvas2: HTMLCanvasElement,

    shareVideoElement: HTMLVideoElement,


    currentSettings: CurrentSettings

}

/**
 * Main Component
 */
class App extends React.Component {

    state: AppState = {
        videoTileStates: {},
        roster: {},
        bodyPix: null,
        messagingSocket: null,
        stamps: {},
        messagingConsumer: [],

        inputVideoStream: null,
        inputVideoElement: document.createElement("video"),
        inputVideoCanvas: document.createElement("canvas"),
        inputMaskCanvas: document.createElement("canvas"),
        virtualBGImage: document.createElement("img"),
        virtualBGCanvas: document.createElement("canvas"),
        inputVideoCanvas2: document.createElement("canvas"),
        outputAudioElement: document.createElement("audio"),

        shareVideoElement: document.createElement("video"),


        currentSettings: {
            mute: false,
            videoEnable: true,
            speakerEnable: true,
            selectedInputAudioDevice: NO_DEVICE_SELECTED,
            selectedInputVideoDevice: NO_DEVICE_SELECTED,
            selectedInputVideoResolution: NO_DEVICE_SELECTED,
            selectedOutputAudioDevice: NO_DEVICE_SELECTED,
            virtualBackgroundPath: "/resources/vbg/pic0.jpg",
            focuseAttendeeId: "",
            globalMessages: [],

            selectedInputVideoDevice2: NO_DEVICE_SELECTED,

        },
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
        console.log("updateVideoTileState", this.state.videoTileStates)
    }
    removeVideoTileState = (tileId: number) => {
        delete this.state.videoTileStates[tileId]
        this.setState({})
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
        console.log("changeAttendeeStatus", attendeeId)
        const props = this.props as any
        const gs = this.props as GlobalState
        //props.changeAttendeeStatus(attendeeId, volume, muted, signalStrength, gs.baseURL, gs.roomID)
        const roster = this.state.roster
        if ((attendeeId in roster) === false) {
            roster[attendeeId] = {
                attendeeId: attendeeId,
                name: null,
                active: false,
                volume: null,
                muted: null,
                signalStrength: null
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
        
        console.log("DATAMESSAGE 5:", dataMessage)
        if(dataMessage.topic === MessageType.Message.toString()){

        }else if(dataMessage.topic === MessageType.Stamp.toString()){
            const json = JSON.parse(Buffer.from(dataMessage.data).toString())
            console.log("DATAMESSAGE 6:", json.data)
            console.log(dataMessage)
            const data = JSON.parse(json.data)

            const message: Message = {
                type: data.cmd,
                startTime: data.startTime,
                targetId: data.targetId,
                imgSrc: data.imgPath ? data.imgPath : undefined,
                message: data.message ? data.message : undefined,
            }
            this.state.currentSettings.globalMessages.push(message)

        }else if(dataMessage.topic === MessageType.Drawing.toString()){
            const json = JSON.parse(Buffer.from(dataMessage.data).toString())
            const data = JSON.parse(json.data)
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
        const videoEnable = !this.state.currentSettings.videoEnable
        const currentSettings = this.state.currentSettings
        currentSettings.videoEnable = videoEnable
        this.setState({ currentSettings: currentSettings })
        if (videoEnable) {
            //gs.meetingSession!.audioVideo.startLocalVideoTile()
            this.selectInputVideoDevice(currentSettings.selectedInputVideoResolution)
        } else {
            this.state.inputVideoStream?.getVideoTracks()[0].stop()
            //gs.meetingSession!.audioVideo.stopLocalVideoTile()
        }
    }

    selectInputVideoDevice = (deviceId: string) => {

        console.log("SELECT INPUTDEVICE", deviceId)
        getVideoDevice(deviceId).then(stream => {
            if (stream !== null) {
                const inputVideoElement = this.state.inputVideoElement!
                inputVideoElement.srcObject = stream;
                inputVideoElement.play()
                this.setState({inputVideoStream:stream})
                return new Promise((resolve, reject) => {
                    this.state.inputVideoElement!.onloadedmetadata = () => {
                        resolve();
                    };
                });
            }
        }).catch((e) => {
            console.log("DEVICE:error:", e)
        });

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
        const currentSettings = this.state.currentSettings
        currentSettings.virtualBackgroundPath = imgPath
        this.setState({ currentSettings: currentSettings })        
    }

    setFocusedAttendee = (attendeeId: string) => {
        console.log("focus:", this.state.currentSettings.focuseAttendeeId)
        const currentSettings = this.state.currentSettings
        currentSettings.focuseAttendeeId = attendeeId
        this.setState({ currentSettings: currentSettings })
    }
    // For Messaging

    sendStamp = (targetId: string, imgPath: string) => {
        const message = {
            action: 'sendmessage',
            data: JSON.stringify({ "cmd": MessageType.Stamp, "targetId": targetId, "imgPath": imgPath, "startTime": Date.now() })
        };
        this.state.messagingSocket?.send(JSON.stringify(message))
        // this.state.localStamps.push(stamp)
    }

    sendStampBySignal = (targetId: string, imgPath: string) => {
        const gs = this.props as GlobalState
        const message = {
            action: 'sendmessage',
            data: JSON.stringify({ "cmd": MessageType.Stamp, "targetId": targetId, "imgPath": imgPath, "startTime": Date.now() })
        };
        gs.meetingSession?.audioVideo.realtimeSendDataMessage(MessageType.Stamp.toString(), JSON.stringify(message))
    }

    sendText = (targetId: string, msg: string) => {
        const message = {
            action: 'sendmessage',
            data: JSON.stringify({ "cmd": MessageType.Message, "targetId": targetId, "message": msg, "startTime": Date.now() })
        };
        this.state.messagingSocket?.send(JSON.stringify(message))
        // this.state.localStamps.push(stamp)
    }

    // // Messaging Callbacks
    // addMessagingConsumer = (func:()=>{}) =>{
    //     this.state.messagingConsumer.push(func)
    // }

    sendDrawsingBySignal = (targetId: string, mode:string, startXR:number, startYR:number, endXR:number, endYR:number, stroke:string, lineWidth:number)=>{
        const gs = this.props as GlobalState
        const message={
            action: 'sendmessage',
            data: JSON.stringify({ 
                cmd         : MessageType.Drawing,
                targetId    : targetId, 
                startTime   : Date.now(),
                mode        : mode,
                startXR     : startXR,
                startYR     : startYR,
                endXR       : endXR,
                endYR       : endYR,
                stroke      : stroke,
                lineWidth   : lineWidth
            })
        }
        gs.meetingSession?.audioVideo.realtimeSendDataMessage(MessageType.Drawing.toString(), JSON.stringify(message))
    }

    callbacks: { [key: string]: any } = {
        toggleMute: this.toggleMute,
        selectInputAudioDevice: this.selectInputAudioDevice,
        toggleVideo: this.toggleVideo,
        selectInputVideoDevice: this.selectInputVideoDevice,
        toggleSpeaker: this.toggleSpeaker,
        selectOutputAudioDevice: this.selectOutputAudioDevice,
        sharedVideoSelected: this.sharedVideoSelected,
        playSharedVideo: this.playSharedVideo,
        pauseSharedVideo: this.pauseSharedVideo,
        sharedDisplaySelected: this.sharedDisplaySelected,
        stopSharedDisplay: this.stopSharedDisplay,
        setVirtualBackground: this.setVirtualBackground,
        setFocusedAttendee: this.setFocusedAttendee,
        sendStamp: this.sendStamp,
        sendText: this.sendText,

        // addMessagingConsumer: this.addMessagingConsumer,
        selectInputVideoDevice2: this.selectInputVideoDevice2,
        sendStampBySignal: this.sendStampBySignal,
        sendDrawsingBySignal: this.sendDrawsingBySignal,
    }


    componentDidMount() {
        requestAnimationFrame(() => this.drawVideoCanvas())
        // requestAnimationFrame(() => this.drawOverlayCanvas())
    }


    drawVideoCanvas = () => {
        const bodyPixNet: bodyPix.BodyPix = this.state.bodyPix!

        const updateInterval = 100
        if (this.state.currentSettings.videoEnable === false) {
            const ctx = this.state.inputVideoCanvas2.getContext("2d")!
            const inputVideoCanvas2 = this.state.inputVideoCanvas2
            inputVideoCanvas2.width = 6
            inputVideoCanvas2.height = 4
            ctx.fillStyle = "grey"
            ctx.fillRect(0, 0, this.state.inputVideoCanvas2.width, this.state.inputVideoCanvas2.height)
            setTimeout(this.drawVideoCanvas, updateInterval);
        } else if (this.state.currentSettings.virtualBackgroundPath === "/resources/vbg/pic0.jpg") {
            const ctx = this.state.inputVideoCanvas2.getContext("2d")!
            const inputVideoCanvas2 = this.state.inputVideoCanvas2
            inputVideoCanvas2.width = this.state.inputVideoStream?.getTracks()[0].getSettings().width!
            inputVideoCanvas2.height = this.state.inputVideoStream?.getTracks()[0].getSettings().height!
            ctx.drawImage(this.state.inputVideoElement, 0, 0, this.state.inputVideoCanvas2.width, this.state.inputVideoCanvas2.height)
            requestAnimationFrame(() => this.drawVideoCanvas())
        } else {

            //// (1) Generate input image for segmentation.
            // To avoid to be slow performace, resolution is limited when using virtual background
            const inputVideoCanvas = this.state.inputVideoCanvas
            inputVideoCanvas.width = 640
            inputVideoCanvas.height = (this.state.inputVideoCanvas.width / 16) * 9
            const canvas = document.createElement("canvas")
            canvas.width  = 640
            canvas.height =  (this.state.inputVideoCanvas.width / 16) * 9
            const ctx = canvas.getContext("2d")!
            ctx.drawImage(this.state.inputVideoElement, 0, 0, canvas.width, canvas.height)

            //// (2) Segmentation & Mask
            //// (2-1) Segmentation.
            bodyPixNet.segmentPerson(canvas).then((segmentation) => {
                //// (2-2) Generate mask
                const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
                const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
                const backgroundMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
                const opacity = 1.0;
                const maskBlurAmount = 2;
                const flipHorizontal = false;
                bodyPix.drawMask(this.state.inputMaskCanvas, canvas, backgroundMask, opacity, maskBlurAmount, flipHorizontal);
                const maskedImage = this.state.inputMaskCanvas.getContext("2d")!.getImageData(0, 0, this.state.inputMaskCanvas.width, this.state.inputMaskCanvas.height)

                //// (2-3) Generate background
                const virtualBGImage = this.state.virtualBGImage
                virtualBGImage.src = this.state.currentSettings.virtualBackgroundPath
                const virtualBGCanvas = this.state.virtualBGCanvas
                virtualBGCanvas.width = maskedImage.width
                virtualBGCanvas.height = maskedImage.height
                const ctx = this.state.virtualBGCanvas.getContext("2d")!
                ctx.drawImage(this.state.virtualBGImage, 0, 0, this.state.virtualBGCanvas.width, this.state.virtualBGCanvas.height)
                const bgImageData = ctx.getImageData(0, 0, this.state.virtualBGCanvas.width, this.state.virtualBGCanvas.height)

                //// (2-4) merge background and mask
                const pixelData = new Uint8ClampedArray(maskedImage.width * maskedImage.height * 4)
                for (let rowIndex = 0; rowIndex < maskedImage.height; rowIndex++) {
                    for (let colIndex = 0; colIndex < maskedImage.width; colIndex++) {
                        const pix_offset = ((rowIndex * maskedImage.width) + colIndex) * 4
                        if (maskedImage.data[pix_offset] === 255 &&
                            maskedImage.data[pix_offset + 1] === 255 &&
                            maskedImage.data[pix_offset + 2] === 255 &&
                            maskedImage.data[pix_offset + 3] === 255
                        ) {
                            pixelData[pix_offset] = bgImageData.data[pix_offset]
                            pixelData[pix_offset + 1] = bgImageData.data[pix_offset + 1]
                            pixelData[pix_offset + 2] = bgImageData.data[pix_offset + 2]
                            pixelData[pix_offset + 3] = bgImageData.data[pix_offset + 3]
                        } else {
                            pixelData[pix_offset] = maskedImage.data[pix_offset]
                            pixelData[pix_offset + 1] = maskedImage.data[pix_offset + 1]
                            pixelData[pix_offset + 2] = maskedImage.data[pix_offset + 2]
                            pixelData[pix_offset + 3] = maskedImage.data[pix_offset + 3]
                        }
                    }
                }
                const imageData = new ImageData(pixelData, maskedImage.width, maskedImage.height);

                //// (2-5) output
                const inputVideoCanvas2 = this.state.inputVideoCanvas2
                inputVideoCanvas2.width = imageData.width
                inputVideoCanvas2.height = imageData.height
                inputVideoCanvas2.getContext("2d")!.putImageData(imageData, 0, 0)

            })
            requestAnimationFrame(() => this.drawVideoCanvas())
        }
    }



    drawOverlayCanvas = () => {

        requestAnimationFrame(() => this.drawOverlayCanvas())
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
                const netPromise = bodyPix.load();

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


                Promise.all([deviceListPromise, netPromise]).then(([deviceList, bodyPix]) => {
                    const audioInputDevices = deviceList['audioinput']
                    const videoInputDevices = deviceList['videoinput']
                    const audioOutputDevices = deviceList['audiooutput']
                    const inputVideoResolutions = ["360p", "540p", "720p"]
                    this.setState({bodyPix:bodyPix})

                    const currentSettings = this.state.currentSettings
                    currentSettings.selectedInputAudioDevice = audioInputDevices![0] ? audioInputDevices![0]['deviceId'] : NO_DEVICE_SELECTED
                    currentSettings.selectedInputVideoDevice = videoInputDevices![0] ? videoInputDevices![0]['deviceId'] : NO_DEVICE_SELECTED
                    currentSettings.selectedInputVideoResolution = inputVideoResolutions![0] ? inputVideoResolutions![0] : NO_DEVICE_SELECTED
                    currentSettings.selectedOutputAudioDevice = audioOutputDevices![0] ? audioOutputDevices![0]['deviceId'] : NO_DEVICE_SELECTED
                    props.lobbyPrepared(audioInputDevices, videoInputDevices, audioOutputDevices)
                    props.refreshRoomList()

                    getVideoDevice(currentSettings.selectedInputVideoDevice).then(stream => {
                        if (stream !== null) {
                            this.state.inputVideoElement!.srcObject = stream
                            this.state.inputVideoElement!.play()
                            this.setState({
                                inputVideoStream: stream,
                                stamps: stamps,
                                currentSettings: currentSettings
                            })
                            return new Promise((resolve, reject) => {
                                this.state.inputVideoElement!.onloadedmetadata = () => {
                                    resolve();
                                };
                            });
                        }
                    })
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

                // Messaging Websocket
                const messagingURLWithQuery = `${MESSAGING_URL}?joinToken=${defaultMeetingSession.configuration.credentials!.joinToken}&meetingId=${defaultMeetingSession.configuration.meetingId}&attendeeId=${defaultMeetingSession.configuration.credentials!.attendeeId}`
                console.log("MESSAGEING_URL", messagingURLWithQuery)
                const messagingSocket = new ReconnectingPromisedWebSocket(
                    messagingURLWithQuery,
                    [],
                    'arraybuffer',
                    new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
                    new FullJitterBackoff(1000, 0, 10000)
                );
                const messagingSocketPromise = messagingSocket.open(20 * 1000);




                // @ts-ignore
                const mediaStream = this.state.inputVideoCanvas2.captureStream()
                console.log("MS", mediaStream)
                const auidoInputPromise = defaultMeetingSession.audioVideo.chooseAudioInputDevice(this.state.currentSettings.selectedInputAudioDevice)
                const auidooutputPromise = defaultMeetingSession.audioVideo.chooseAudioOutputDevice(this.state.currentSettings.selectedOutputAudioDevice)
                const videoInputPromise = defaultMeetingSession.audioVideo.chooseVideoInputDevice(mediaStream)

                Promise.all([auidoInputPromise, auidooutputPromise, videoInputPromise, messagingSocketPromise]).then(() => {
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
                    props.meetingPrepared(meetingSessionConf, defaultMeetingSession)


                    messagingSocket.addEventListener('message', (e: Event) => {
                        const data = JSON.parse((e as MessageEvent).data);
                        console.log("Messaging!", data)
                        const message: Message = {
                            type: data.cmd,
                            startTime: data.startTime,
                            targetId: data.targetId,
                            imgSrc: data.imgPath ? data.imgPath : undefined,
                            message: data.message ? data.message : undefined,
                        }
                        this.state.currentSettings.globalMessages.push(message)
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