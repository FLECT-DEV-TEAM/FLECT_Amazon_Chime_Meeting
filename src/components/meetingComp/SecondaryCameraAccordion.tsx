import * as React from 'react';
import { Accordion, Icon, Dropdown } from 'semantic-ui-react';
import { GlobalState } from '../../reducers';
import { getVideoDevice } from '../utils';
import { AppState } from '../App';


const trigger = (
  <span>
    <Icon name="video camera" />secondary camera(expemrimental)
  </span>
)


interface SecondaryCameraAccordionState {
  open: boolean
  selectedCameraDeviceId: string
}

class SecondaryCameraAccordion extends React.Component {

  secondaryVideoRef = React.createRef<HTMLVideoElement>()

  state: SecondaryCameraAccordionState = {
    open: false,
    selectedCameraDeviceId: "none",
  }

  handleClick() {
    this.setState({ open: !this.state.open })
  }

  setSecondaryCamera = (selectedCameraDeviceId:string) =>{
    const props = this.props as any
    const appState = props.appState as AppState

    console.log(selectedCameraDeviceId)
    if(selectedCameraDeviceId !== "none" &&  this.secondaryVideoRef.current!==null){
      getVideoDevice(selectedCameraDeviceId).then(stream => {
        if (stream !== null) {
            this.secondaryVideoRef.current!.srcObject = stream
            this.secondaryVideoRef.current!.play()
        }
        Object.keys(appState.joinedMeetings).forEach((meetingId:string)=>{
          // @ts-ignore
          appState.joinedMeetings[meetingId].meetingSession?.audioVideo.startContentShare(this.secondaryVideoRef.current!.captureStream())
        })

      }).catch((e) => {
          console.log("DEVICE:error:", e)
      });
    }else if(this.secondaryVideoRef.current!==null){
      this.secondaryVideoRef.current!.srcObject = null
      Object.keys(appState.joinedMeetings).forEach((meetingId:string)=>{
        // @ts-ignore
        appState.joinedMeetings[meetingId].meetingSession?.audioVideo.stopContentShare()
      })
    }
    this.setState({selectedCameraDeviceId: selectedCameraDeviceId})

  }


  ////////////////////////////////
  /// UI
  ///////////////////////////////
  generateAccordion = () => {
    const gs = this.props as GlobalState
    const inputVideoDevicesOpts = gs.inputVideoDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
    inputVideoDevicesOpts.push({key:"none", text:"none", value:"none"})

    const grid = (
      <Accordion>
        <Accordion.Title
          active={this.state.open}
          index={0}
          onClick={() => { this.handleClick() }}
        >
          <Icon name='dropdown' />
            Secondary camera(experimental)
        </Accordion.Title>
        <Accordion.Content active={this.state.open}>
          <Dropdown
            pointing='top left'
            options={inputVideoDevicesOpts}
            trigger={trigger}
            onChange={(e, { value }) => this.setSecondaryCamera(value as string)}
          />

          <video ref={this.secondaryVideoRef} autoPlay width="200px" height="160px"/>
        </Accordion.Content>
      </Accordion>
    )
    return grid
  }


  render() {
    return this.generateAccordion()
  }

}

export default SecondaryCameraAccordion;

