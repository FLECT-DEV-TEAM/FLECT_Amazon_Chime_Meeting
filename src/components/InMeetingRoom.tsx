import * as React from 'react';
import { Button,Grid, Icon, Accordion} from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { VideoTileState, ReconnectingPromisedWebSocket, DefaultPromisedWebSocketFactory, DefaultDOMWebSocketFactory, FullJitterBackoff } from 'amazon-chime-sdk-js';

import { NO_DEVICE_SELECTED, BUTTON_COLOR, BUTTON_COLOR_DISABLE, BUTTON_COLOR_IFRAME_ENABLE } from '../const';
import { MESSAGING_URL} from '../config';
import * as bodyPix from '@tensorflow-models/body-pix';
import { getVideoDevice, getTileId } from './utils';
import { RS_STAMPS } from './resources';
import MicControl from './meetingComp/MicControl';
import VideoControl from './meetingComp/VideoControl';
import SpeakerControl from './meetingComp/SpeakerControl';
import VideoShareControl from './meetingComp/VideoShareControl';
import DisplayShareControl from './meetingComp/DisplayShareControl';
import SettingControl from './meetingComp/SettingControl';
import ExitControl from './meetingComp/ExitControl';
import AttendeeList from './meetingComp/AttendeeList';
import StampAccordion from './meetingComp/StampAccordion';
import OverlayVideoElement from './meetingComp/OverlayVideoElement';
import MainOverlayVideoElement from './meetingComp/MainOverlayVideoElement';
import SendTextAccordion from './meetingComp/SendTextAccordion';


enum MessageType {
  Message,
  Stamp,
}

interface Message {
  type      : MessageType
  startTime : number
  targetId  : string
  imgSrc    : string
  message   : string
}


interface InMeetingState {
  mute: boolean,
  videoEnable: boolean,
  speakerEnable: boolean,
  localVideoWidth: number,
  localVideoHeight: number,
  inputVideoStream: MediaStream | null,
  settingOpen: boolean,
  virtualBackground: string,
  showIFrame: boolean,
  focuseAttendeeId: string,

  globalMessages : Message[],
  stampControlOpened: boolean,
  messagingSocket: ReconnectingPromisedWebSocket | null,
}

class InMeetingRoom extends React.Component {
  state: InMeetingState = {
    mute: false,
    videoEnable: true,
    speakerEnable: true,
    localVideoWidth: 0,
    localVideoHeight: 0,
    inputVideoStream: null,
    settingOpen: false,
    virtualBackground: "/resources/vbg/pic0.jpg",
    showIFrame: false,
    focuseAttendeeId: "",
    globalMessages: [],
    stampControlOpened: false,
    messagingSocket: null
  }

  audioRef = React.createRef<HTMLAudioElement>()

  localVideoRef = React.createRef<HTMLVideoElement>()
  localVideoCanvasRef = React.createRef<HTMLCanvasElement>()
  localVideoMaskCanvasRef = React.createRef<HTMLCanvasElement>()
  localVideoMaskCanvasRef2 = React.createRef<HTMLCanvasElement>()
  shareVideoRef = React.createRef<HTMLVideoElement>()
  shareVideoRef2 = React.createRef<HTMLVideoElement>()
  localVideoMaskBackgroundRef = React.createRef<HTMLImageElement>()
  localVideoMaskBGCanvasRef = React.createRef<HTMLCanvasElement>()

  // videoMainRef = React.createRef<HTMLVideoElement>()
  mainOverlayVideoRef = React.createRef<MainOverlayVideoElement>()
  AttendeeListRef     = React.createRef<AttendeeList>()
  buttonColor              = BUTTON_COLOR
  buttonColorDisable       = BUTTON_COLOR_DISABLE
  buttonColorIFrameEnable  = BUTTON_COLOR_IFRAME_ENABLE

  stamps: { [key: string]: HTMLImageElement } = {}
  ////////////////////////////////
  /// User Action
  ///////////////////////////////

  // For Microphone
  toggleMute = () => {
    const gs = this.props as GlobalState
    const props = this.props as any

    this.state.mute = !this.state.mute
    if (this.state.mute) {
      gs.meetingSession!.audioVideo.realtimeMuteLocalAudio();
    } else {
      gs.meetingSession!.audioVideo.realtimeUnmuteLocalAudio();
    }
    this.setState({})
  }
  selectInputAudioDevice = (deviceId: string) => {
    const gs = this.props as GlobalState
    const props = this.props as any

    gs.meetingSession!.audioVideo.chooseAudioInputDevice(deviceId)
    props.selectInputAudioDevice(deviceId)
  }

  // For Camera
  toggleVideo = () => {
    const gs = this.props as GlobalState
    this.state.videoEnable = !this.state.videoEnable
    this.selectInputVideoDevice(gs.selectedInputVideoDevice)
  }

  selectInputVideoDevice = (deviceId: string) => {
    const gs = this.props as GlobalState
    const props = this.props as any

    if (deviceId !== NO_DEVICE_SELECTED && this.state.videoEnable === true) {
      getVideoDevice(deviceId).then(stream => {
        if (stream !== null) {
          this.state.localVideoWidth = stream.getVideoTracks()[0].getSettings().width ? stream.getVideoTracks()[0].getSettings().width! : 0
          this.state.localVideoHeight = stream.getVideoTracks()[0].getSettings().height ? stream.getVideoTracks()[0].getSettings().height! : 0
          this.localVideoRef.current!.srcObject = stream;
          this.state.inputVideoStream = stream
          return new Promise((resolve, reject) => {
            this.localVideoRef.current!.onloadedmetadata = () => {
              resolve();
            };
          });
        }
      });
      props.selectInputVideoDevice(deviceId)
    } else if (deviceId !== NO_DEVICE_SELECTED) {
      this.state.inputVideoStream?.getVideoTracks()[0].stop()
    } else {
      this.state.inputVideoStream?.getVideoTracks()[0].stop()
      props.selectInputVideoDevice(NO_DEVICE_SELECTED)
    }
  }


  // For Speaker
  toggleSpeaker = () => {
    const gs = this.props as GlobalState
    const props = this.props as any

    this.state.speakerEnable = !this.state.speakerEnable

    if (this.state.speakerEnable) {
      gs.meetingSession!.audioVideo.bindAudioElement(this.audioRef.current!)
    } else {
      gs.meetingSession!.audioVideo.unbindAudioElement();
    }
    this.setState({})
  }

  selectOutputAudioDevice = (deviceId: string) => {
    const gs = this.props as GlobalState
    const props = this.props as any
    gs.meetingSession!.audioVideo.chooseAudioOutputDevice(deviceId)
    props.selectOutputAudioDevice(deviceId)
  }

  // For SharedVideo
  sharedVideoSelected = (e: any) => {
    const gs = this.props as GlobalState
    const path = URL.createObjectURL(e.target.files[0]);

    try {
      gs.meetingSession!.audioVideo.stopContentShare()
      this.shareVideoRef.current!.pause()

    } catch (e) {
    }
    this.shareVideoRef.current!.src = path
    this.shareVideoRef.current!.play()

    setTimeout(
      async () => {
        // @ts-ignore
        const mediaStream: MediaStream = await this.shareVideoRef.current!.captureStream()
        await gs.meetingSession!.audioVideo.startContentShare(mediaStream)
        this.shareVideoRef.current!.currentTime = 0
        this.shareVideoRef.current!.pause()
        this.setState({})
      }
      , 5000); // I don't know but we need some seconds to restart video share....
  }

  playSharedVideo = () => {
    this.shareVideoRef.current!.play()
  }
  pauseSharedVideo = () => {
    this.shareVideoRef.current!.pause()
  }

  // For SharedDisplay
  sharedDisplaySelected = () =>{
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
    this.shareVideoRef.current!.play()
    gs.meetingSession!.audioVideo.stopContentShare()
  }

  // For IFrame
  toggleIFrame = () => {
    this.state.showIFrame = !this.state.showIFrame
    this.setState({})
  }

  // For Setting
  // settingOpen = () => {
  //   this.state.settingOpen = true
  //   this.setState({})
  // }
  // settingClose = () => {
  //   this.state.settingOpen = false
  //   this.setState({})
  // }
  setVirtualBackground = (imgPath: string) => {
    this.state.virtualBackground = imgPath
    console.log("SetVirtual", imgPath)
    this.setState({})
  }


  // For Exit
  leaveMeeting = async () => {
    const props = this.props as any
    const gs = this.props as GlobalState
    gs.meetingSession!.audioVideo.stop()
    await this.state.messagingSocket?.close(20 * 1000);
    props.leaveMeeting()
  }



  setFocusedAttendee = (attendeeId: string) => {
    this.state.focuseAttendeeId = attendeeId
    console.log("focus:", this.state.focuseAttendeeId)
    this.setState({})
  }

  // For stampControl
  toggleStampControl = () => {
    this.state.stampControlOpened = !this.state.stampControlOpened
    this.setState({})
  }

  sendStamp = (targetId:string, imgPath: string) => {
    const message = {
      action: 'sendmessage',
      data: JSON.stringify({ "cmd": MessageType.Stamp, "targetId":targetId, "imgPath": imgPath, "startTime": Date.now()})
    };
    this.state.messagingSocket?.send(JSON.stringify(message))
    // this.state.localStamps.push(stamp)
  }

  sendText = (targetId:string, msg: string) => {
    const message = {
      action: 'sendmessage',
      data: JSON.stringify({ "cmd": MessageType.Message, "targetId":targetId, "message": msg, "startTime": Date.now()})
    };
    this.state.messagingSocket?.send(JSON.stringify(message))
    // this.state.localStamps.push(stamp)
  }

  ////////////////////////////////
  /// Lifecycle Event
  ///////////////////////////////
  /**
   * 
   */
  componentDidMount() {
    const props = this.props as any
    const gs = this.props as GlobalState

    const messagingURLWithQuery = `${MESSAGING_URL}?joinToken=${gs.meetingSession?.configuration.credentials?.joinToken}&meetingId=${gs.meetingSession?.configuration.meetingId}&attendeeId=${gs.meetingSession?.configuration.credentials?.attendeeId}`
    console.log("MESSAGEING_URL", messagingURLWithQuery)
    this.state.messagingSocket = new ReconnectingPromisedWebSocket(
      messagingURLWithQuery,
      [],
      'arraybuffer',
      new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
      new FullJitterBackoff(1000, 0, 10000)
    );
    const messagingSocketPromise = this.state.messagingSocket.open(20 * 1000);

    const webCamPromise = getVideoDevice(gs.selectedInputVideoDevice).then(stream => {
      if (stream !== null) {
        this.state.localVideoWidth = stream.getVideoTracks()[0].getSettings().width ? stream.getVideoTracks()[0].getSettings().width! : 0
        this.state.localVideoHeight = stream.getVideoTracks()[0].getSettings().height ? stream.getVideoTracks()[0].getSettings().height! : 0
        console.log("getVideoTrack", this.state.localVideoWidth, this.state.localVideoHeight)
        this.localVideoRef.current!.srcObject = stream;
        this.state.inputVideoStream = stream
        return new Promise((resolve, reject) => {
          this.localVideoRef.current!.onloadedmetadata = () => {
            resolve();
          };
        });
      }
    });
    const RS_STAMPS_sorted = RS_STAMPS.sort()
    for (const i in RS_STAMPS_sorted) {
      const imgPath = RS_STAMPS_sorted[i]
      const image = new Image()
      image.src = imgPath
      image.onload = () => {
        this.stamps[imgPath] = image
      }
    }

    Promise.all([webCamPromise, messagingSocketPromise])
      .then((res) => {
        this.setMediaStreams()
        this.state.messagingSocket!.addEventListener('message', (e: Event) => {
          const data = JSON.parse((e as MessageEvent).data);
          console.log(data)
          const message:Message = {
            type      : data.cmd,
            startTime : data.startTime,
            targetId  : data.targetId,
            imgSrc    : data.imgPath ? data.imgPath : undefined,
            message    : data.message ? data.message : undefined,
          }
          this.state.globalMessages.push(message)        
        })
      })
      .catch(error => {
        console.error("not find... ", error);
        this.setMediaStreams()
      });
  }

  setMediaStreams = () => {
    const gs = this.props as GlobalState
    // @ts-ignore
    const videoStream = this.localVideoMaskCanvasRef2.current!.captureStream()
    const inputAudioDevicePromise = gs.selectedInputAudioDevice ? gs.meetingSession!.audioVideo.chooseAudioInputDevice(gs.selectedInputAudioDevice) : null
    const inputVideoDevicePromise = gs.meetingSession!.audioVideo.chooseVideoInputDevice(videoStream)
    const outputAudioDevicePromise = gs.selectedOutputAudioDevice ? gs.meetingSession!.audioVideo.chooseAudioOutputDevice(gs.selectedOutputAudioDevice) : null

    Promise.all([inputAudioDevicePromise, inputVideoDevicePromise, outputAudioDevicePromise]).then(() => {

      gs.meetingSession!.audioVideo.bindAudioElement(this.audioRef.current!)
      gs.meetingSession!.audioVideo.start()
      if (this.state.mute) {
        gs.meetingSession!.audioVideo.realtimeMuteLocalAudio();
      } else {
        gs.meetingSession!.audioVideo.realtimeUnmuteLocalAudio();
      }

      if (this.state.speakerEnable) {
        gs.meetingSession!.audioVideo.bindAudioElement(this.audioRef.current!)
      } else {
        gs.meetingSession!.audioVideo.unbindAudioElement();
      }
      gs.meetingSession!.audioVideo.startLocalVideoTile()
      requestAnimationFrame(() => this.drawVideoCanvas())
      requestAnimationFrame(() => this.drawOverlayCanvas())
    })
  }

  drawVideoCanvas = () => {
    const props = this.props as any
    const bodyPixNet: bodyPix.BodyPix = props.bodyPix
    const gs = this.props as GlobalState

    const localVideo = this.localVideoRef.current!               // video
    const localVideoCanvas = this.localVideoCanvasRef.current!         // original image canvas from video
    const localVideoMaskCanvas = this.localVideoMaskCanvasRef.current!     // temporary canvas for segmentation
    const localVideoMaskCanvas2 = this.localVideoMaskCanvasRef2.current!    // to be displayed
    const localVideoMaskBackgroundRef = this.localVideoMaskBackgroundRef.current! // background for virtual background (image)
    const localVideoMaskBGCanvasRef = this.localVideoMaskBGCanvasRef.current!   // background for virtual background (canvas)

    const updateInterval = 100
    if (gs.selectedInputVideoDevice === NO_DEVICE_SELECTED) {
      const ctx = localVideoMaskCanvas2.getContext("2d")!
      localVideoMaskCanvas2.width = 6
      localVideoMaskCanvas2.height = 4
      ctx.fillStyle = "grey"
      ctx.fillRect(0, 0, localVideoMaskCanvas2.width, localVideoMaskCanvas2.height)
      // ctx.fillStyle="green"
      // ctx.fillText("no video",10, 10)
      setTimeout(this.drawVideoCanvas, updateInterval);
    } else if (this.state.virtualBackground === "/resources/vbg/pic0.jpg") {
      const ctx = localVideoMaskCanvas2.getContext("2d")!
      localVideoMaskCanvas2.width = this.state.localVideoWidth
      localVideoMaskCanvas2.height = this.state.localVideoHeight
      ctx.drawImage(localVideo, 0, 0, localVideoMaskCanvas2.width, localVideoMaskCanvas2.height)
      //setTimeout(this.drawVideoCanvas, updateInterval);
      requestAnimationFrame(() => this.drawVideoCanvas())

    } else {

      //// (1) Generate input image for segmentation.
      // To avoid to be slow performace, resolution is limited when using virtual background
      localVideoCanvas.width = 640
      localVideoCanvas.height = (this.localVideoCanvasRef.current!.width / 16) * 9
      // localVideoCanvas.width  = this.state.localVideoWidth
      // localVideoCanvas.height = this.state.localVideoHeight

      const ctx = localVideoCanvas.getContext("2d")!
      ctx.drawImage(localVideo, 0, 0, localVideoCanvas.width, localVideoCanvas.height)


      //// (2) Segmentation & Mask
      //// (2-1) Segmentation.
      bodyPixNet.segmentPerson(localVideoCanvas).then((segmentation) => {
        //// (2-2) Generate mask
        const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
        const backgroundColor = { r: 255, g: 255, b: 255, a: 255 };
        const backgroundMask = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
        const opacity = 1.0;
        const maskBlurAmount = 2;
        const flipHorizontal = false;
        bodyPix.drawMask(localVideoMaskCanvas, localVideoCanvas, backgroundMask, opacity, maskBlurAmount, flipHorizontal);

        const maskedImage = localVideoMaskCanvas.getContext("2d")!.getImageData(0, 0, localVideoMaskCanvas.width, localVideoMaskCanvas.height)

        //// (2-3) Generate background
        localVideoMaskBackgroundRef.src = this.state.virtualBackground
        localVideoMaskBGCanvasRef.width = maskedImage.width
        localVideoMaskBGCanvasRef.height = maskedImage.height
        const ctx = localVideoMaskBGCanvasRef.getContext("2d")!
        ctx.drawImage(localVideoMaskBackgroundRef, 0, 0, localVideoMaskBGCanvasRef.width, localVideoMaskBGCanvasRef.height)
        const bgImageData = ctx.getImageData(0, 0, localVideoMaskBGCanvasRef.width, localVideoMaskBGCanvasRef.height)

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
              pixelData[pix_offset]     = maskedImage.data[pix_offset]
              pixelData[pix_offset + 1] = maskedImage.data[pix_offset + 1]
              pixelData[pix_offset + 2] = maskedImage.data[pix_offset + 2]
              pixelData[pix_offset + 3] = maskedImage.data[pix_offset + 3]
            }
          }
        }
        const imageData = new ImageData(pixelData, maskedImage.width, maskedImage.height);

        //// (2-5) output
        localVideoMaskCanvas2.width = imageData.width
        localVideoMaskCanvas2.height = imageData.height
        localVideoMaskCanvas2.getContext("2d")!.putImageData(imageData, 0, 0)
      })
      // setTimeout(this.drawVideoCanvas, updateInterval);
      requestAnimationFrame(() => this.drawVideoCanvas())

    }
  }

  drawOverlayCanvas = () =>{
    const now = Date.now()
    this.mainOverlayVideoRef.current!.clearCanvas()
    this.AttendeeListRef.current!.clearCanvas()
    for (const i in this.state.globalMessages) {
      const message = this.state.globalMessages[i]
      if (now - message.startTime < 3000) {
        if(message.type === MessageType.Stamp){
          const elapsed          = now - message.startTime
          const image            = this.stamps[message.imgSrc]
          const targetAttendeeId = message.targetId
          this.mainOverlayVideoRef.current!.putStamp(targetAttendeeId, image, message.startTime, elapsed)
          this.AttendeeListRef.current!.putStamp(targetAttendeeId, image, message.startTime, elapsed)
        }else if(message.type === MessageType.Message){
          const elapsed          = now - message.startTime
          const targetAttendeeId = message.targetId
          this.mainOverlayVideoRef.current!.putMessage(targetAttendeeId, message.message, message.startTime, elapsed)
          this.AttendeeListRef.current!.putMessage(targetAttendeeId, message.message, message.startTime, elapsed)
        }
        // ctx.drawImage(image, (stamp.startTime % 5) * 40, localVideoMaskCanvas2.height - localVideoMaskCanvas2.height * (elapsed / 3000), 150, 150)
      }
    }



    requestAnimationFrame(() => this.drawOverlayCanvas())
  }
  /**
   * After components updated, 
   * bind each tile to videoEelement
   */
  componentDidUpdate = () => {

    const props = this.props as any
    const gs = this.props as GlobalState
    const videoTileState = props.videoTileState as { [id: number]: VideoTileState }

    /** show Main Video Element **/
    const focusedTileId = getTileId(this.state.focuseAttendeeId, videoTileState)
    //console.log(this.state.attendeeId, focusedTileId)
    if (focusedTileId >= 0) {
      gs.meetingSession!.audioVideo.bindVideoElement(Number(focusedTileId), this.mainOverlayVideoRef.current!.getVideoRef().current!)
    } else {
    }
  }


  ////////////////////////////////
  /// UI
  ///////////////////////////////

  generateIFrameControl = () => {
    return (
      // @ts-ignore
      <Button.Group color={this.state.showIFrame ? this.buttonColorIFrameEnable : this.buttonColor}>

        <Button
          content="showIFrame"
          labelPosition="left"
          icon="desktop"
          onClick={() => { this.toggleIFrame() }}
        />
      </Button.Group>
    )
  }

  generateToolkitControl = () => {
    const props = this.props as any
    return (
      <div>
      </div>
    )
  }


  render() {
    const props = this.props as any
    const gs = this.props as GlobalState

    return (
      <div style={{ width: "100%", margin: "auto" }}>
        <audio id="meeting-audio" style={{ display: "None" }} ref={this.audioRef} />

        {/* for local video (and virtual background) */}
        <video ref={this.localVideoRef} style={{ display: "None" }} autoPlay />
        <canvas ref={this.localVideoCanvasRef} style={{ display: "None" }} width="100%" height="100%" />
        <canvas ref={this.localVideoMaskCanvasRef} width="100%" height="100%" style={{ display: "None" }} />
        <canvas ref={this.localVideoMaskCanvasRef2} width="100%" height="100%" style={{ display: "None" }} />
        <img ref={this.localVideoMaskBackgroundRef} src={this.state.virtualBackground} style={{ display: "None" }} />
        <canvas ref={this.localVideoMaskBGCanvasRef} style={{ display: "None" }} />

        {/* for shared contents */}
        <video ref={this.shareVideoRef}  style={{ display: "None" }} width="30%" height="30%" />
        <video ref={this.shareVideoRef2} style={{ display: "None" }} width="100%" height="100%" />

        <Grid divided='vertically'>
          {/* 1st row. for control buttons*/}
          <Grid.Row columns={4}>
            {/****** 1st column. for User ID *****/}
            <Grid.Column textAlign="center" width={2}>
              {gs.userName}@{gs.roomTitle}({gs.region})
            </Grid.Column>

            {/****** 2nd column. Main buttons *****/}
            <Grid.Column textAlign="center" width={4}>
              <MicControl {...props} toggleMute={this.toggleMute} mute={this.state.mute}
                          selectInputAudioDevice={this.selectInputAudioDevice} 
                          inputAudioDevicesOpts={gs.inputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })}
                          />
              <span > </span>
              <VideoControl {...props} toggleVideo={this.toggleVideo}  enable={this.state.videoEnable}
                          selectInputVideoDevice={this.selectInputVideoDevice} 
                          inputVideoDevicesOpts={gs.inputVideoDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })}
                        />

              <span > </span>
              <SpeakerControl {...props} toggleSpeaker={this.toggleSpeaker}  enable={this.state.speakerEnable}
                          selectOutputAudioDevice={this.selectOutputAudioDevice} 
                          outputAudioDevicesOpts={gs.outputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })}
                        />
              <span > </span>
            </Grid.Column>


            {/****** 3rd column. ext buttons *****/}
            <Grid.Column textAlign="center" width={8}>
              {/****  Video Share ****/}
              <VideoShareControl  {...props} sharedVideoSelected={this.sharedVideoSelected}
                            playSharedVideo={this.playSharedVideo} pauseSharedVideo={this.pauseSharedVideo}
                          />
              <span > </span>

              {/****  Screen Share ****/}
              <DisplayShareControl {...props} 
                            stopSharedDisplay={this.stopSharedDisplay}
                            sharedDisplaySelected={this.sharedDisplaySelected}
                          />
              {/* {this.generateDisplayShareControl()} */}
              <span > </span>
              {this.generateIFrameControl()}
              <span > </span>
            </Grid.Column>


            {/****** 4th column. ext buttons *****/}
            <Grid.Column textAlign="center" width={2}>
              <SettingControl {...props} setVirtualBackground={this.setVirtualBackground} virtualBackground={this.state.virtualBackground}/>
              <span > </span>
              <ExitControl {...props} leaveMeeting={this.leaveMeeting} />
              <span > </span>

            </Grid.Column>
          </Grid.Row>

          {/* 2nd row. for main video and roster*/}
          <Grid.Row stretched>
            <Grid.Column  width={12}>
              <Grid>
                <Grid.Row stretched>
                  <Grid.Column width={16}>
                    <MainOverlayVideoElement {...props} ref={this.mainOverlayVideoRef} thisAttendeeId={this.state.focuseAttendeeId}/>
                    {/* <video ref={this.videoMainRef} width="95%" height="100%" /> */}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row stretched>
                  <Grid.Column width={16}>
                    <AttendeeList ref={this.AttendeeListRef} {...props} setFocusedAttendee={this.setFocusedAttendee} focusedAttendeeId={this.state.focuseAttendeeId}/>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Grid.Column>
            <Grid.Column  width={4}>
              {this.generateToolkitControl()}
            </Grid.Column>
          </Grid.Row >

          {/* 3rd row.*/}
          <Grid.Row columns={3}>
            <Grid.Column textAlign="center" width={4}>
              {/* {this.generateAttendeeList(loginUserGrids, attendeeGrids, loginUserSharedContentGrids, attendeeSharedContentGrids)} */}
            </Grid.Column>
          </Grid.Row>
        </Grid>

      </div>
    )
  }

}

export default InMeetingRoom;

