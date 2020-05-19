import { createActions } from 'redux-actions';

export const Actions = createActions(
    {
        'INITIALIZE'                    : (args) => (args),
        'ENTER_SESSION'                 : (...args) => (args),
        'JOIN'                          : (...args) => (args),
        'INITIALIZED_SESSION'           :(...args) => (args),
        'SET_DEVICES'                   : (...args) => (args),
        'SELECT_INPUT_AUDIO_DEVICE'     : (args)=>(args),
        'SELECT_INPUT_VIDEO_DEVICE'     : (args)=>(args),
        'SELECT_INPUT_VIDEO_RESOLUTION' : (args)=>(args),
        'SELECT_OUTPUT_AUDIO_DEVICE'    : (args)=>(args),
        'START_MEETING'                 :(args)=>(args),
        'LEAVE_MEETING'                 :(args)=>(args),

        'GET_ATTENDEE_INFORMATION'      : (...args) => (args),
        'UPDATE_ATTENDEE_INFORMATION'   : (...args) => (args),
    },
)

