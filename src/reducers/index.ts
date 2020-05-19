import { AppStatus, NO_DEVICE_SELECTED } from "../const"
import { MeetingSessionConfiguration, DefaultMeetingSession, DefaultModality } from "amazon-chime-sdk-js"


interface StoreRoster{
    attendeeId     : string,
    baseAttendeeId : string,
    name           : string
}



export interface GlobalState {
    counter                           : number
    baseURL                           : string
    roomID                            : string
    userName                          : string
    userAttendeeId                    : string
    userBaseAttendeeId                : string
    region                            : string

    joinInfo                          : any
    meetingSessionConf                : MeetingSessionConfiguration | null
    meetingSession                    : DefaultMeetingSession | null

    inputAudioDevices                 : MediaDeviceInfo[]  | null
    inputVideoDevices                 : MediaDeviceInfo[]  | null
    inputVideoResolutions             : string[]
    outputAudioDevices                : MediaDeviceInfo[] | null
    selectedInputAudioDevice          : string
    selectedInputVideoDevice          : string
    selectedInputVideoResolution      : string
    selectedOutputAudioDevice         : string

    storeRoster                       : {[attendeeId:string]:StoreRoster}

    status                            : string
}

export const initialState = {
    counter                             : 0,
    baseURL                             : "",
    roomID                              : "",
    userName                            : "",
    userAttendeeId                      : "",
    userBaseAttendeeId                  : "",
    region                              : "",

    joinInfo                            : null,
    meetingSessionConf                  : null,
    meetingSession                      : null,

    inputAudioDevices                   : null,
    inputVideoDevices                   : null,
    inputVideoResolutions               : ["360p", "540p", "720p"],
    outputAudioDevices                  : null,
    selectedInputAudioDevice            : NO_DEVICE_SELECTED,
    selectedInputVideoResolution        : NO_DEVICE_SELECTED,
    selectedInputVideoDevice            : NO_DEVICE_SELECTED,
    selectedOutputAudioDevice           : NO_DEVICE_SELECTED,


    storeRoster                         : {},

    status                              : AppStatus.LOGIN
}


const reducer = (state: GlobalState = initialState, action: any) => {
    var gs: GlobalState = Object.assign({}, state)
    gs.counter++
    console.log(state, action)
    switch (action.type) {
        case 'INITIALIZE':
            gs.baseURL = action.payload
            break
        case 'ENTER_SESSION':
            console.log('enter session (do nothing)')
            break
        case 'JOIN':
            gs.status = AppStatus.SELECT_DEVICE
            gs.baseURL = action.payload[0]
            gs.roomID = action.payload[1]
            gs.userName = action.payload[2]
            gs.region = action.payload[3]
            gs.joinInfo = action.payload[4]
            gs.userAttendeeId   = action.payload[4].Attendee.AttendeeId
            gs.userBaseAttendeeId = encodeURIComponent(new DefaultModality(gs.userAttendeeId).base());

            break

        case 'INITIALIZED_SESSION':
            gs.meetingSessionConf = action.payload[0]
            gs.meetingSession = action.payload[1]
            break

        case 'SET_DEVICES':
            gs.inputAudioDevices = action.payload[0]
            gs.inputVideoDevices = action.payload[1]
            gs.inputVideoResolutions = action.payload[2]
            gs.outputAudioDevices = action.payload[3]
            gs.selectedInputAudioDevice      = gs.inputAudioDevices![0]     ? gs.inputAudioDevices![0]['deviceId']  : NO_DEVICE_SELECTED
            gs.selectedInputVideoDevice      = gs.inputVideoDevices![0]     ? gs.inputVideoDevices![0]['deviceId']  : NO_DEVICE_SELECTED
            gs.selectedInputVideoResolution  = gs.inputVideoResolutions![0] ? gs.inputVideoResolutions![0]          : NO_DEVICE_SELECTED
            gs.selectedOutputAudioDevice     = gs.outputAudioDevices![0]    ? gs.outputAudioDevices![0]['deviceId'] : NO_DEVICE_SELECTED
            break
        

        case 'SELECT_INPUT_AUDIO_DEVICE':
            gs.selectedInputAudioDevice = action.payload
            break
                        
        case 'SELECT_INPUT_VIDEO_DEVICE':
            gs.selectedInputVideoDevice = action.payload
            break
        case 'SELECT_INPUT_VIDEO_RESOLUTION':
            gs.selectedInputVideoResolution = action.payload
            break

        case 'SELECT_OUTPUT_AUDIO_DEVICE':
            gs.selectedOutputAudioDevice = action.payload
            break

        case 'START_MEETING':
            gs.status = AppStatus.IN_MEETING_ROOM
            break
        case 'LEAVE_MEETING':
            gs = initialState
            break

        case 'UPDATE_ATTENDEE_INFORMATION':
            const attendeeId = action.payload[0]
            const baseAttendeeId = action.payload[1]
            const name = action.payload[2]
            gs.storeRoster[attendeeId] = {
                attendeeId : attendeeId,
                baseAttendeeId :baseAttendeeId,
                name:name
            }
            break


    }
    return gs
}

export default reducer;
