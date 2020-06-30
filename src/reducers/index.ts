import { AppStatus, AppEntranceStatus, AppMeetingStatus, AppLobbyStatus, LocalVideoConfigs } from "../const"

interface StoreRoster{
    attendeeId     : string,
    baseAttendeeId : string,
    name           : string
}

interface WindowConfig{
    leftBarDisplay    : boolean
    rightBarDisplay   : boolean
    mainScreenDisplay : boolean
    tileScreenDisplay : boolean
}

export interface MeetingMetadata{
    OwnerId     : string
    PassCode    : string
    Region      : string
    Secret      : boolean
    UsePassCode : boolean
    UserName    : string
    StartTime   : number
}

export interface MeetingInfo{
    meetingId   : string
    meetingName : string
    metaData    : MeetingMetadata
    meeting     : any |null
}

export interface JoinInfo{
    MeetingName: string
    Attendee:{
        AttendeeId: string
        ExternalUserId: string
        JoinToken: string
    },
    Meeting:{
        MeetingId: string
        MediaRegion: string
        MediaPlacement:{
            AudioFallbackUrl: string
            AudioHostUrl: string
            ScreenDataUrl: string
            ScreenSharingUrl: string
            ScreenViewingUrl: string
            SignalingUrl: string
            TurnControlUrl: string
        }
    }
}

export interface GlobalState {
    counter                           : number
    baseURL                           : string
    userName                          : string
    userId                            : string
    code                              : string

    windowConfig                      : WindowConfig
    meetings                          : MeetingInfo[] // meeting list in the server, not joined meeting only
    joinInfos                         : {[meetingId:string]:JoinInfo}
    preparingMeetingId                : string|null,

    inputAudioDevices                 : MediaDeviceInfo[]  | null
    inputVideoDevices                 : MediaDeviceInfo[]  | null
    inputVideoResolutions             : string[]
    outputAudioDevices                : MediaDeviceInfo[] | null

    storeRosters                      : {[meetingId:string]:{[attendeeId:string]:StoreRoster}} 

    status                            : AppStatus
    entranceStatus                    : AppEntranceStatus
    meetingStatus                     : AppMeetingStatus
    lobbyStatus                       : AppLobbyStatus

    showError                         : boolean
    errorMessage                      : string
}

export const initialState:GlobalState = {
    counter                             : 0,
    baseURL                             : "",
    userName                            : "",
    userId                              : "",
    code                                : "",

    windowConfig                        : 
        {
            leftBarDisplay    : true,
            rightBarDisplay   : true,
            mainScreenDisplay : true,
            tileScreenDisplay : true,
        },
    meetings                            : [],


    joinInfos                           : {},
    preparingMeetingId                  : null,
    // meetingSessionConf                  : null,
    // meetingSession                      : null,

    inputAudioDevices                   : null,
    inputVideoDevices                   : null,
    inputVideoResolutions               : Object.keys(LocalVideoConfigs),
    outputAudioDevices                  : null,


    storeRosters                         : {},

    status                              : AppStatus.STARTED,
    entranceStatus                             : AppEntranceStatus.NONE,
    meetingStatus                       : AppMeetingStatus.NONE,
    lobbyStatus                         : AppLobbyStatus.NONE,
    showError                           : false,
    errorMessage                        : "",
}


const reducer = (state: GlobalState = initialState, action: any) => {
    var gs: GlobalState = Object.assign({}, state)
    gs.counter++
    console.log(state, action)
    let tmp:any
    switch (action.type) {
        case 'INITIALIZE':
            gs = initialState
            break
        case 'GO_ENTRANCE':
            gs.status = AppStatus.IN_ENTRANCE
            gs.entranceStatus = AppEntranceStatus.NONE
            gs.baseURL = action.payload
            break
        case 'USER_CREATED':
            gs.entranceStatus  = AppEntranceStatus.USER_CREATED
            gs.userName  = action.payload[0]
            gs.userId    = action.payload[1]
            gs.code      = action.payload[2]
            break

        case 'LOGIN':
            gs.entranceStatus  = AppEntranceStatus.EXEC_LOGIN // avoid looping
            break

        case 'USER_LOGINED':
            gs.status   = AppStatus.IN_LOBBY
            gs.entranceStatus  = AppEntranceStatus.NONE
            gs.lobbyStatus = AppLobbyStatus.WILL_PREPARE
            gs.userName  = action.payload[0]
            gs.userId    = action.payload[1]
            gs.code      = action.payload[2]
            break
        case 'LOBBY_PREPARED':
            gs.lobbyStatus = AppLobbyStatus.DONE_PREPARE
            gs.inputAudioDevices = action.payload[0]
            gs.inputVideoDevices = action.payload[1]
            gs.outputAudioDevices = action.payload[2]
            break
    

        case 'GOT_ALL_ROOM_LIST':
            tmp = action.payload[0]
            console.log(tmp)
            gs.meetings = tmp.map((meeting:any)=>{
                console.log("-->", meeting.MeetingId)
                return {
                    meetingId   : meeting.MeetingId,
                    meetingName : meeting.MeetingName,
                    metaData    : meeting.Metadata,
                    meeting     : meeting.MeetingInfo.Meeting,
                }
            })
            console.log(gs)
            break

        case 'JOINED_MEETING':
            gs.status        = AppStatus.IN_MEETING
            gs.meetingStatus = AppMeetingStatus.WILL_PREPARE
            const joininfo   = action.payload[0] as JoinInfo
            gs.joinInfos[joininfo.Meeting.MeetingId] = joininfo
            gs.preparingMeetingId = joininfo.Meeting.MeetingId
            break

        // case 'LEFT_MEETING':
        //     gs.status        = AppStatus.IN_MEETING
        //     gs.meetingStatus = AppMeetingStatus.WILL_CLEAR
        //     // gs.joinInfo      = 
        //     break
    


        case 'MEETING_PREPARED':
            gs.status        = AppStatus.IN_MEETING
            gs.meetingStatus = AppMeetingStatus.DONE_PREPARE
            gs.preparingMeetingId = null
            break

        case 'CLEARED_MEETING_SESSION':
            gs.meetingStatus = AppMeetingStatus.NONE
            const cleardMeetingId = action.payload[0] as string
            delete gs.joinInfos[cleardMeetingId]
            if(Object.keys(gs.joinInfos).length === 0 ){
                gs.status        = AppStatus.IN_LOBBY
            }
            break

        case 'SHOW_ERROR':
            gs.showError    = true
            gs.errorMessage = action.payload[0]
            break
        case 'CLOSE_ERROR':
            gs.showError    = false
            gs.errorMessage = ""
            break

        case 'TOGGLE_LEFT_BAR':
            gs.windowConfig.leftBarDisplay = !gs.windowConfig.leftBarDisplay
            break
        case 'TOGGLE_RIGHT_BAR':
            gs.windowConfig.rightBarDisplay = !gs.windowConfig.rightBarDisplay
            break
        case 'CREATE_MEETING_ROOM':
            //SAGA
            break

        case 'UPDATE_ATTENDEE_INFORMATION':
            const meetingId  = action.payload[0]
            const attendeeId = action.payload[1]
            const baseAttendeeId = action.payload[2]
            const name = action.payload[3]
            if(gs.storeRosters[meetingId]===undefined){
                gs.storeRosters[meetingId] = {}
            }
            gs.storeRosters[meetingId][attendeeId] = {
                attendeeId : attendeeId,
                baseAttendeeId :baseAttendeeId,
                name:name
            }
            break


    }
    return gs
}

export default reducer;
