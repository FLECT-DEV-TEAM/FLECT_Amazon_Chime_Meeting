import * as React from 'react';
import { Button, Form } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { testSound } from './TestSound';
import { NO_DEVICE_SELECTED } from '../const';


class SelectDevice extends React.Component {
  startAudioMonitoring = false

  audioDeviceNode: AnalyserNode | null = null
  countAudioDeviceChanged = 0

  state = { audioVolume: 0 }

  inputAudioDevicesRef     = React.createRef<HTMLFormElement>()
  inputVideoDevicesRef     = React.createRef<HTMLFormElement>()
  inputVideoResolutionsRef = React.createRef<HTMLFormElement>()
  outputAudioDevicesRef    = React.createRef<HTMLFormElement>()

  volumeMonitorRef         = React.createRef<HTMLCanvasElement>()
  videoPreviewRef          = React.createRef<HTMLVideoElement>()

  /**
   * 
   */
  setVolumeMonitor = (): void => {
    const gs = this.props as GlobalState
    this.audioDeviceNode = gs.meetingSession!.audioVideo.createAnalyserNodeForAudioInput();
    if (!this.audioDeviceNode) {
      return;
    }
  }

  /**
   * 
   */
  monitorVolume = (countAudioDeviceChanged: number) => {
    if (!this.audioDeviceNode) {
      this.startAudioMonitoring = false
      return;
    }
    if (countAudioDeviceChanged !== this.countAudioDeviceChanged) {
      console.log(countAudioDeviceChanged, this.countAudioDeviceChanged)
      return
    }

    const data = new Uint8Array(this.audioDeviceNode.fftSize);
    this.audioDeviceNode!.getByteTimeDomainData(data);
    const lowest = 0.01;
    let max = lowest;
    for (const f of Array.from(data)) {
      max = Math.max(max, (f - 128) / 128);
    }
    let normalized = (Math.log(lowest) - Math.log(max)) / Math.log(lowest);
    let percent = Math.min(Math.max(normalized * 100, 0), 100);

    this.state.audioVolume = percent
    //console.log(percent)
    this.startAudioMonitoring = true
    try{
      const ctx = this.volumeMonitorRef.current!.getContext("2d")!
      this.volumeMonitorRef.current!.height = 10
      ctx.clearRect(0, 0, this.volumeMonitorRef.current!.width, this.volumeMonitorRef.current!.height)
      ctx.fillRect(0, 0, (this.volumeMonitorRef.current!.width * percent) / 100, this.volumeMonitorRef.current!.height)
  
      requestAnimationFrame(() => { this.monitorVolume(countAudioDeviceChanged) });
    }catch(e){
      console.log("this exception is not a issue.", e)
    }
  }


  /**
   * 
   */
  enter = () => {
    const props = this.props as any
    const gs = this.props as GlobalState
    this.countAudioDeviceChanged++ // stop the volume monitor
    // if (gs.selectedInputVideoDevice !== undefined) {   
      try{
        gs.meetingSession?.audioVideo.stopVideoPreviewForVideoInput(this.videoPreviewRef.current!)
      }catch(e){
        console.log(e)
        console.log("if video camera is none, above exception is not prblem. quick hack.")
      }
    // }
    props.startMeeting()
  }

  /**
   * 
   */
  render() {
    const props = this.props as any
    const gs = this.props as GlobalState

    // generate device options
    const inputAudioDevicesOpts     = gs.inputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
    const inputVideoDevicesOpts     = gs.inputVideoDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
    const inputVideoResolutionsOpts = gs.inputVideoResolutions!.map(info => { return { key: info, text: info, value: info } })
    const outputAudioDevicesOpts    = gs.outputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })

    inputVideoDevicesOpts.push({key: NO_DEVICE_SELECTED, text: NO_DEVICE_SELECTED, value: NO_DEVICE_SELECTED})

    // For Input Video Device
    if (gs.selectedInputVideoDevice !== NO_DEVICE_SELECTED) {
      gs.meetingSession!.audioVideo.chooseVideoInputDevice(gs.selectedInputVideoDevice).then(() => {
        gs.meetingSession!.audioVideo.startVideoPreviewForVideoInput(this.videoPreviewRef.current!)
      })
    }else{
      try{
        gs.meetingSession!.audioVideo.stopVideoPreviewForVideoInput(this.videoPreviewRef.current!)
        gs.meetingSession!.audioVideo.chooseVideoInputDevice(null)
      }catch(e){
        console.log(e)
        console.log("if video camera is none, above exception is not prblem. quick hack.")
      }

    }

    // For Input Audio Device
    if (gs.selectedInputAudioDevice !== NO_DEVICE_SELECTED) {
      gs.meetingSession!.audioVideo.chooseAudioInputDevice(gs.selectedInputAudioDevice).then(() => {
        this.setVolumeMonitor()
        this.countAudioDeviceChanged++
        this.monitorVolume(this.countAudioDeviceChanged)
      });
    }

    // For Input Video Resolution
    if (gs.selectedInputVideoResolution !== NO_DEVICE_SELECTED) {
      switch (gs.selectedInputVideoResolution) {
        case '360p':
          gs.meetingSession!.audioVideo.chooseVideoInputQuality(640, 360, 15, 600);
          break;
        case '540p':
          gs.meetingSession!.audioVideo.chooseVideoInputQuality(960, 540, 15, 1400);
          break;
        case '720p':
          gs.meetingSession!.audioVideo.chooseVideoInputQuality(1280, 720, 15, 1400);
          break;
      }
    }

    // For Input Output Audio Device
    if (gs.selectedOutputAudioDevice !== NO_DEVICE_SELECTED) {
      gs.meetingSession!.audioVideo.chooseAudioOutputDevice(gs.selectedOutputAudioDevice);
    }

    return (
      <div style = {{ width: "60%", height: "100%", margin: "auto" }}>
        <Form>
          <Form.Field>
            <label>Microphone</label>
            <Form.Dropdown placeholder = ''
              selection
              options = {inputAudioDevicesOpts}
              value = {gs.selectedInputAudioDevice}
              onChange = {(e, { value }) => props.selectInputAudioDevice(value)}
              ref = {this.inputAudioDevicesRef} />
            <canvas
              ref = {this.volumeMonitorRef}
              style = {{ width: "50%", height: "1%" }}
            />
          </Form.Field>

          <Form.Field>
            <label>Camera</label>
            <Form.Dropdown placeholder = '' 
              selection 
              options = {inputVideoDevicesOpts} 
              value = {gs.selectedInputVideoDevice} 
              onChange = {(e, { value }) => props.selectInputVideoDevice(value)} 
              ref = {this.inputVideoDevicesRef} />
          </Form.Field>

          <Form.Field>
            <label>Camera Resolution</label>
            <Form.Dropdown placeholder = '' 
              selection 
              options = {inputVideoResolutionsOpts}
              value = {gs.selectedInputVideoResolution} 
              onChange = {(e, { value }) => props.selectInputVideoResolution(value)} 
              ref = {this.inputVideoResolutionsRef} />
          </Form.Field>
          
          <Form.Field>
            <video style = {{ width: "50%", height: "50%" }} ref = {this.videoPreviewRef} ></video>
          </Form.Field>

          <Form.Field>
            <label>Speaker</label>
            <Form.Dropdown placeholder='' 
              selection 
              options = {outputAudioDevicesOpts} 
              value = {gs.selectedOutputAudioDevice} 
              onChange = {(e, { value }) => props.selectOutputAudioDevice(value)}
              ref = {this.outputAudioDevicesRef} />
          </Form.Field>
          <Form.Field>
            <Button onClick = {() => { testSound(gs.selectedOutputAudioDevice) }} >TEST SOUND</Button>
          </Form.Field>
          <Button type = 'Join Meeting' onClick = {() => this.enter()}>Submit</Button>
        </Form>
      </div>
    )
  }
}

export default SelectDevice;

