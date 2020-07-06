///////////////////////////////////////////////////
/// Do not chnage from here
///////////////////////////////////////////////////
export const NO_DEVICE_SELECTED = "none"
export const NO_FOCUSED = "none"

// export const AppStatus = {
//     LOGIN: "LOGIN",
    
//     CREATED_MEETING_ROOM: "select_device",
//     ENTERING_SESSION: "ENTERING_SESSION",
//     SELECT_DEVICE: "select_device",
//     IN_MEETING_ROOM: "in_meeting_room",
//     NEXT: "next",
// }

export enum AppStatus{
    STARTED,
    IN_ENTRANCE,
    IN_LOBBY,
    IN_MEETING,
}
export enum AppEntranceStatus{
    NONE,
    USER_CREATED,
    EXEC_LOGIN,
}
export enum AppLobbyStatus{
    NONE,
    WILL_PREPARE,
    DONE_PREPARE,
}

export enum AppMeetingStatus{
    NONE,
    WILL_PREPARE,
    DONE_PREPARE,
    WILL_CLEAR,
}



export interface LobbyMainColumnConfigInf{
    left  : number
    center: number
    right : number
}
export const LobbyMainColumnConfigDefault:LobbyMainColumnConfigInf = {
    left   : 3,
    center : 10,
    right  : 3,
}
export const LobbyMainColumnConfigMainOnly:LobbyMainColumnConfigInf = {
    left   : 0,
    center : 16,
    right  : 0,
}
export const LobbyMainColumnConfigMainNoRoomList:LobbyMainColumnConfigInf = {
    left   : 0,
    center : 13,
    right  : 3,
}
export const LobbyMainColumnConfigMainNoUserPanel:LobbyMainColumnConfigInf = {
    left   : 3,
    center : 13,
    right  : 0,
}

export const LobbyMainColumnConfig = {
    default     : LobbyMainColumnConfigDefault,
    mainOnly    : LobbyMainColumnConfigMainOnly,
    noRoomList  : LobbyMainColumnConfigMainNoRoomList,
    noUserPanel : LobbyMainColumnConfigMainNoUserPanel,
}

export interface LocalVideoConfig {
    name:string,
    width:number,
    height:number,
    frameRate:number,
    maxBandwidthKbps: number,
}
//["180p", "360p", "540p", "720p"],
export const LocalVideoConfig180p:LocalVideoConfig = {
    name: "180p",
    width:320,
    height:180,
    frameRate:15,
    maxBandwidthKbps: 200,
}
export const LocalVideoConfig180p2:LocalVideoConfig = {
    name: "180p",
    width:320,
    height:180,
    frameRate:15,
    maxBandwidthKbps: 100,
}
export const LocalVideoConfig180p3:LocalVideoConfig = {
    name: "180p",
    width:320,
    height:180,
    frameRate:15,
    maxBandwidthKbps: 50,
}

export const LocalVideoConfig360p:LocalVideoConfig = {
    name: "360p",
    width:640,
    height:360,
    frameRate:15,
    maxBandwidthKbps: 600,
}
export const LocalVideoConfig540p:LocalVideoConfig = {
    name: "540p",
    width:960,
    height:540,
    frameRate:15,
    maxBandwidthKbps: 1500,
}
export const LocalVideoConfig720p:LocalVideoConfig = {
    name: "720p",
    width:1280,
    height:720,
    frameRate:15,
    maxBandwidthKbps: 2000,
}

export const LocalVideoConfigs:{[key:string]:LocalVideoConfig} = {
    vc180p: LocalVideoConfig180p,
    vc180p2: LocalVideoConfig180p2,
    vc180p3: LocalVideoConfig180p3,
    vc360p: LocalVideoConfig360p,
    vc540p: LocalVideoConfig540p,
    vc720p: LocalVideoConfig720p,
}

export const LOGGER_BATCH_SIZE: number = 85;
export const LOGGER_INTERVAL_MS: number = 1150;




export const BUTTON_COLOR               = 'teal'
export const BUTTON_COLOR_DISABLE       = 'grey'
export const BUTTON_COLOR_IFRAME_ENABLE = 'red'





