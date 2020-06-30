import { DeviceChangeObserver } from "amazon-chime-sdk-js";
import App from "./App";

class DeviceChangeObserverImpl implements DeviceChangeObserver{
    app:App
    props:any    
    meetingId:string
    constructor(meetingId:string, app:App, props:any){
        this.app = app
        this.props = props
        this.meetingId=meetingId
    }

    audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void {
        console.log("audioInputsChanged", _freshAudioInputDeviceList)
        //this.populateAudioInputList();
    }
    audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
        console.log("audioOutputsChanged", _freshAudioOutputDeviceList)
        //this.populateAudioOutputList();
    }
    videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void {
        console.log("videoInputsChanged", _freshVideoInputDeviceList)
        //this.populateVideoInputList();
    }
}

export default DeviceChangeObserverImpl