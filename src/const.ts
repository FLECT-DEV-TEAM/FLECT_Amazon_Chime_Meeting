///////////////////////////////////////////////////
/// Do not chnage from here
///////////////////////////////////////////////////
export const NO_DEVICE_SELECTED = "none"

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
export enum AppStatus2{
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




export const LOGGER_BATCH_SIZE: number = 85;
export const LOGGER_INTERVAL_MS: number = 1150;




export const BUTTON_COLOR               = 'teal'
export const BUTTON_COLOR_DISABLE       = 'grey'
export const BUTTON_COLOR_IFRAME_ENABLE = 'red'





