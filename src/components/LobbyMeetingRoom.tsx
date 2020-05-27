import * as React from 'react';
import { Button, Form, Grid, GridColumn, Menu, Dropdown, Icon } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf, AppStatus} from '../const'
import MainOverlayVideoElement from './meetingComp/MainOverlayVideoElement';
import { VideoTileState } from 'amazon-chime-sdk-js';
import { getTileId } from './utils';
import App, { AppState } from './App';
import OverlayVideoElement from './meetingComp/OverlayVideoElement';
import { MESSAGING_URL } from '../config';


class MainScreen extends React.Component{
    mainOverlayVideoRef = React.createRef<MainOverlayVideoElement>()

    render(){
        const props = this.props as any
        const appState = props.appState as AppState
        const gs = this.props as GlobalState
        const thisAttendeeId = props.thisAttendeeId 
        const attendeeInfo = appState.roster[thisAttendeeId]
        let attendeeName = "no focused"
        let icon = <div/>
        if(attendeeInfo === undefined){
        }else{
            attendeeName = (attendeeInfo.name !== undefined && attendeeInfo.name !== null)? attendeeInfo.name!.substring(0,20) : "unknown"
            icon = attendeeInfo.muted ? (<Icon name="mute"  color="red" />) : (<Icon name="unmute"/>)
        }

        const focusedTileId = getTileId(thisAttendeeId, appState.videoTileStates)
        if(focusedTileId > 0 && this.mainOverlayVideoRef.current !== null){
            gs.meetingSession?.audioVideo.bindVideoElement(focusedTileId, this.mainOverlayVideoRef.current.getVideoRef().current!)
        }

        return(
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <MainOverlayVideoElement {...props} ref={this.mainOverlayVideoRef}/>
                        {icon}
                        {attendeeName}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }

}



class TileScreenTile extends React.Component{
    tileOverlayVideoRef = React.createRef<MainOverlayVideoElement>()

    render(){
        const props = this.props as any
        const appState = props.appState as AppState
        const gs = this.props as GlobalState
        const thisAttendeeId = props.thisAttendeeId 
        const attendeeInfo = appState.roster[thisAttendeeId]
        let attendeeName = "loading...."
        let icon = <span/>
        let focusIcon = <span/>
        if(attendeeInfo === undefined){
        }else{
            attendeeName = (attendeeInfo.name !== undefined && attendeeInfo.name !== null)? attendeeInfo.name!.substring(0,20) : "unknown"
            icon = attendeeInfo.muted ? (<Icon name="mute"  color="red" />) : (<Icon name="unmute"/>)
            focusIcon = thisAttendeeId === appState.currentSettings.focuseAttendeeId ? (<Icon name="eye"  color="red" />) : (<span />)
        }



        const thisTileId = getTileId(thisAttendeeId, appState.videoTileStates)
        if(thisTileId > 0 && this.tileOverlayVideoRef.current !== null){
            gs.meetingSession?.audioVideo.bindVideoElement(thisTileId, this.tileOverlayVideoRef.current.getVideoRef().current!)
        }

        return(
            <Grid.Column width={4} >
                <div style={{padding:"5px"}}>
                <OverlayVideoElement {...props} ref={this.tileOverlayVideoRef}/>
                {icon}
                {focusIcon}
                {attendeeName}
                </div>
            </Grid.Column>
        )
    }

}

interface LobbyMeetingRoomState{
    showMainScreen: boolean
    showTileScreen: boolean
}

class LobbyMeetingRoom extends React.Component {
    state:LobbyMeetingRoomState = {
        showMainScreen:true,
        showTileScreen:true,
    }
    toggleShowMainScreen = () =>{this.setState({showMainScreen:!this.state.showMainScreen})}
    toggleShowTileScreen = () =>{this.setState({showTileScreen:!this.state.showTileScreen})}



    ovrefs: React.RefObject<MainOverlayVideoElement>[]= []

    id2ref:{[key:number]:React.RefObject<MainOverlayVideoElement>} = {}
    cells:JSX.Element[] = []

    message = () => {
        console.log("message cunsume!")
    }

    render() {
        this.cells = []
        this.id2ref = {}
        const gs = this.props as GlobalState
        const props = this.props as any
        const appState = props.appState as AppState
        if(gs.status !== AppStatus.IN_MEETING){
            return(<div />)
        }

        for(let key in appState.videoTileStates){
            const attendeeId = appState.videoTileStates[key].boundAttendeeId
            const tileId = appState.videoTileStates[key].tileId
            const tmpRef = React.createRef<MainOverlayVideoElement>()
            this.id2ref[tileId!] = tmpRef
            const cell = (
                <TileScreenTile  {...props} thisAttendeeId={attendeeId}/>
            )
            this.cells.push(cell)
        }


        return (
            <div>

                <Menu stackable  secondary>
                    <Menu.Item as="h2"
                        name={gs.joinInfo?.MeetingName}
                    >
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item color="teal" onClick={(e)=>{this.toggleShowMainScreen()}} active={this.state.showMainScreen}>
                            <Icon name="square full" />
                        </Menu.Item>
                        <Menu.Item color="teal" onClick={(e)=>{this.toggleShowTileScreen()}} active={this.state.showTileScreen}>
                            <Icon name="grid layout"/>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>


                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            {this.state.showMainScreen?
                            (<MainScreen {...props} thisAttendeeId={appState.currentSettings.focuseAttendeeId}/>)
                            :
                            (<div/>)
                            }
                            
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row >
                        {this.state.showTileScreen?
                            this.cells
                            :
                            (<div/>)
                            }                        
                    </Grid.Row>
                </Grid>
            </div>
        )

    }


    componentDidUpdate = () => {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState    

        console.log(gs)
        // for(let i in this.id2ref){
        //     const tmpRef = this.id2ref[i]
        //     gs.meetingSession?.audioVideo.bindVideoElement(Number(i), tmpRef.current!.getVideoRef().current!)
        // }
    }
}

export default LobbyMeetingRoom;

