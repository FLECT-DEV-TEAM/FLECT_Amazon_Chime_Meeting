import * as React from 'react';
import { Button, Form, Grid, GridColumn } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf, AppStatus} from '../const'
import MainOverlayVideoElement from './meetingComp/MainOverlayVideoElement';
import { VideoTileState } from 'amazon-chime-sdk-js';
import { getTileId } from './utils';
import { AppState } from './App';
import OverlayVideoElement from './meetingComp/OverlayVideoElement';

class LobbyMeetingRoom extends React.Component {
    mainOverlayVideoRef = React.createRef<MainOverlayVideoElement>()

    ovrefs: React.RefObject<MainOverlayVideoElement>[]= []

    id2ref:{[key:number]:React.RefObject<MainOverlayVideoElement>} = {}
    cells:JSX.Element[] = []
    render() {
        this.cells = []
        this.id2ref = {}
        const gs = this.props as GlobalState
        const props = this.props as any
        const appState = props.appState as AppState
        for(let key in appState.videoTileStates){
            const attendeeId = appState.videoTileStates[key].boundAttendeeId
            const tileId = appState.videoTileStates[key].tileId
            const tmpRef = React.createRef<MainOverlayVideoElement>()
            this.id2ref[tileId!] = tmpRef
            const cell = (
                <Grid.Column width={4}>
                    <OverlayVideoElement {...props} ref={tmpRef} thisAttendeeId={attendeeId}/>
                    {appState.videoTileStates[key].boundAttendeeId}
                    local: {appState.videoTileStates[key].localTile}
                </Grid.Column>
            )
            this.cells.push(cell)
        }


        return (
            <div>
                <MainOverlayVideoElement {...props} ref={this.mainOverlayVideoRef} thisAttendeeId={appState.currentSettings.focuseAttendeeId}/>
                <Grid>
                    <Grid.Row>
                        {this.cells}
                    </Grid.Row>
                </Grid>
            </div>
        )

        

    }


    componentDidUpdate = () => {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const videoTileState = props.videoTileState as { [id: number]: VideoTileState }

        console.log(gs)
        const focusedTileId = getTileId(appState.currentSettings.focuseAttendeeId, appState.videoTileStates)
        if(focusedTileId > 0){
            gs.meetingSession?.audioVideo.bindVideoElement(focusedTileId, this.mainOverlayVideoRef.current!.getVideoRef().current!)
        }
        // if(gs.status === AppStatus.IN_MEETING){
        //     const focusedTileId = getTileId(gs.joinInfo!.Attendee.AttendeeId, appState.videoTileStates)
        //     console.log("FOCUS!1: ",focusedTileId)

        //     if(focusedTileId >= 0){
        //         console.log("FOCUS!2: ",focusedTileId)
        //         gs.meetingSession!.audioVideo.bindVideoElement(1, this.mainOverlayVideoRef.current!.getVideoRef().current!)
        //         gs.meetingSession!.audioVideo.bindVideoElement(2, this.mainOverlayVideoRef2.current!.getVideoRef().current!)
        //     }
        for(let i in this.id2ref){
            const tmpRef = this.id2ref[i]
            gs.meetingSession?.audioVideo.bindVideoElement(Number(i), tmpRef.current!.getVideoRef().current!)
        }
    }
}

export default LobbyMeetingRoom;

