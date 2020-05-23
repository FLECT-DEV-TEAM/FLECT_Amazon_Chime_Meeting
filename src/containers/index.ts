import { Dispatch } from 'redux';
import { connect } from 'react-redux'

import { Actions } from '../actions'
import App from '../components/App'
import { GlobalState } from '../reducers';
import { MeetingSessionConfiguration, DefaultMeetingSession, VideoTileState } from 'amazon-chime-sdk-js';

export interface Props {
}

function mapStateToProps(state:GlobalState) {
  return state
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    initialize:    () => {dispatch(Actions.initialize())},
    setup     :    (base_url:string) => {dispatch(Actions.setup(base_url))},
    createUser:    (userName:string, code:string) =>{dispatch(Actions.createUser(userName, code))},
    login     :    (userName:string, code:string) =>{dispatch(Actions.login(userName, code))},
 
    createMeeting: (userName:string, roomName:string, region:string, usePassCode:boolean, passCode:string, secret:boolean) =>
                    {dispatch(Actions.createMeeting(userName, roomName, region, usePassCode, passCode, secret))},
    
    refreshRoomList: () => {dispatch(Actions.refreshRoomList())},

    joinMeeting:    (meetingId:string, gs:GlobalState) =>
                      {dispatch(Actions.joinMeeting(meetingId, gs))},



    createMeetingRoom:  (base_url:string, roomID:string, name:string, region:string) =>
                      {dispatch(Actions.createMeetingRoom(base_url, roomID, name, region))},

    enterSession:  (base_url:string, roomID:string, name:string, region:string) =>
                      {dispatch(Actions.enterSession(base_url, roomID, name, region))},

    initializedSession: (meetingSessionConf:MeetingSessionConfiguration, defaultMeetingSession:DefaultMeetingSession) =>
                      {dispatch(Actions.initializedSession(meetingSessionConf, defaultMeetingSession))},

    setDevices: (audioInputDevices:MediaDeviceInfo[], videoInputDevices:MediaDeviceInfo[], videoInputResolutions:string[], audioOutputDevices:MediaDeviceInfo[]) =>
                      {dispatch(Actions.setDevices(audioInputDevices, videoInputDevices, videoInputResolutions, audioOutputDevices))},
    selectInputAudioDevice:(val:string)     => {dispatch(Actions.selectInputAudioDevice(val))},
    selectInputVideoDevice:(val:string)     => {dispatch(Actions.selectInputVideoDevice(val))},
    selectInputVideoResolution:(val:string) => {dispatch(Actions.selectInputVideoResolution(val))},
    selectOutputAudioDevice:(val:string)    => {dispatch(Actions.selectOutputAudioDevice(val))},
    startMeeting:() =>{dispatch(Actions.startMeeting())},
    leaveMeeting:() =>{dispatch(Actions.leaveMeeting())},
    // updateActiveScore:(scores: { [attendeeId: string]: number }) => {dispatch(Actions.updateActiveScore(scores))},
    // changeActiveSpeaker: (attendeeId:string) =>{dispatch(Actions.changeActiveSpeaker(attendeeId))},

    getAttendeeInformation: (baseURL:string, roomID:string, attendeeId:string) => {dispatch(Actions.getAttendeeInformation(baseURL, roomID, attendeeId))},
    updateAttendeeInformation: (attendeeId:string, baseAttendeeId:string, name:string) =>{dispatch(Actions.updateAttendeeInformation(attendeeId, baseAttendeeId, name))},

  }
}

const Connector = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default Connector;
