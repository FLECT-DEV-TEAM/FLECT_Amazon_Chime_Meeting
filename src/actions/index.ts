import { createActions } from 'redux-actions';

export const Actions = createActions(
    {
        'INITIALIZE'                    : (args)    => (args),
        'GO_ENTRANCE'                   : (args)    => (args),
        'CREATE_USER'                   : (...args) => (args),
        'USER_CREATED'                  : (...args) => (args),
        'LOGIN'                         : (...args) => (args),
        'USER_LOGINED'                  : (...args) => (args),

        'CREATE_MEETING'                : (...args) => (args),
        'CREATED_MEETING'               : (...args) => (args),

        'REFRESH_ROOM_LIST'             : (args)    => (args),
        'GOT_ALL_ROOM_LIST'             : (...args) => (args),

        'JOIN_MEETING'                  : (...args) => (args),
        'JOINED_MEETING'                : (...args) => (args),
        'LEAVE_MEETING'                 : (...args) => (args),
        'LEFT_MEETING'                  : (...args) => (args),
        'CLEARED_MEETING_SESSION'       : (...args) => (args),

        'SHOW_ERROR'                    : (...args) => (args),
        'CLOSE_ERROR'                   : (...args) => (args),

        'CREATE_MEETING_ROOM'           : (...args) => (args),
        
        'ENTER_SESSION'                 : (...args) => (args),
        'MEETING_PREPARED'           : (...args) => (args),
        'LOBBY_PREPARED'                : (...args) => (args),
        'START_MEETING'                 : (args)    => (args),

        'GET_ATTENDEE_INFORMATION'      : (...args) => (args),
        'UPDATE_ATTENDEE_INFORMATION'   : (...args) => (args),

        'TOGGLE_LEFT_BAR'   : (...args) => (args),
        'TOGGLE_RIGHT_BAR'   : (...args) => (args),

    },
)

