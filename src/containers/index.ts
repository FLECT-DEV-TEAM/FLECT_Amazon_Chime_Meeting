import { Dispatch } from 'redux';
import { connect } from 'react-redux'

import { Actions } from '../actions'
import App from '../components/App'
import { GlobalState } from '../reducers';
import { MeetingSessionConfiguration, DefaultMeetingSession } from 'amazon-chime-sdk-js';

export interface Props {
}

function mapStateToProps(state:GlobalState) {
  return state
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    initialize:    () => {dispatch(Actions.initialize())},
    goEntrance:    (base_url:string) => {dispatch(Actions.goEntrance(base_url))},
    createUser:    (userName:string, code:string) =>{dispatch(Actions.createUser(userName, code))},
    login     :    (userName:string, code:string) =>{dispatch(Actions.login(userName, code))},
 
    lobbyPrepared: (audioInputDevices:MediaDeviceInfo[], videoInputDevices:MediaDeviceInfo[], audioOutputDevices:MediaDeviceInfo[]) =>
                    {dispatch(Actions.lobbyPrepared(audioInputDevices, videoInputDevices,  audioOutputDevices))},
    createMeeting: (userName:string, roomName:string, region:string, usePassCode:boolean, passCode:string, secret:boolean) =>
                    {dispatch(Actions.createMeeting(userName, roomName, region, usePassCode, passCode, secret))},
  
    refreshRoomList: () => {dispatch(Actions.refreshRoomList())},

    joinMeeting:    (meetingId:string, gs:GlobalState) =>
                      {dispatch(Actions.joinMeeting(meetingId, gs))},
    leaveMeeting:    (meetingId:string, gs:GlobalState) =>
                      {dispatch(Actions.leaveMeeting(meetingId, gs))},

    meetingPrepared: () => {dispatch(Actions.meetingPrepared())},
    clearedMeetingSession: () =>{dispatch(Actions.clearedMeetingSession())},


    closeError: () => {dispatch(Actions.closeError())},

    toggleLeftBar: ()=>{dispatch(Actions.toggleLeftBar())},
    toggleRightBar: ()=>{dispatch(Actions.toggleRightBar())},


    createMeetingRoom:  (base_url:string, roomID:string, name:string, region:string) =>
                      {dispatch(Actions.createMeetingRoom(base_url, roomID, name, region))},

    enterSession:  (base_url:string, roomID:string, name:string, region:string) =>
                      {dispatch(Actions.enterSession(base_url, roomID, name, region))},


    startMeeting:() =>{dispatch(Actions.startMeeting())},
    // updateActiveScore:(scores: { [attendeeId: string]: number }) => {dispatch(Actions.updateActiveScore(scores))},
    // changeActiveSpeaker: (attendeeId:string) =>{dispatch(Actions.changeActiveSpeaker(attendeeId))},



    getAttendeeInformation: (meetingID:string, attendeeId:string) => {dispatch(Actions.getAttendeeInformation(meetingID, attendeeId))},
    updateAttendeeInformation: (attendeeId:string, baseAttendeeId:string, name:string) =>{dispatch(Actions.updateAttendeeInformation(attendeeId, baseAttendeeId, name))},

  }
}

const Connector = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default Connector;
