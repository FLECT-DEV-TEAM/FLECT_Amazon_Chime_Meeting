import * as React from 'react';
import { Grid, Menu, Icon, Label } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { AppStatus} from '../const'
import MainOverlayVideoElement from './meetingComp/MainOverlayVideoElement';
import { getTileId } from './utils';
import { AppState } from './App';
import OverlayVideoElement from './meetingComp/OverlayVideoElement';



const colors = [
    'red',
    'orange',
    'yellow',
    'olive',
    'green',
    'teal',
    'blue',
    'violet',
    'purple',
    'pink',
    'brown',
    'grey',
    'black',
  ]
  


class MainScreen extends React.Component{
    state={drawingStroke:"black", enableDrawing:false, erasing:false}
    mainOverlayVideoRef = React.createRef<MainOverlayVideoElement>()
    labelExampleCircular = () => (
        <span>
          {colors.map((color) => (
              //@ts-ignore
            <Label circular empty as="a" color={color} key={color} active={color===this.state.drawingStroke}
                link onClick={()=>{
                    this.mainOverlayVideoRef.current!.setDrawingStroke(color);
                    this.mainOverlayVideoRef.current!.setErasing(false);
                    this.mainOverlayVideoRef.current!.setDrawingMode(true)
                    this.setState({
                        drawingStroke:color,
                        enableDrawing:true,
                        erasing:false,
                    })

                }
            } />
          ))}
        </span>
      )
    render(){
        const props = this.props as any
        const appState = props.appState as AppState
        const gs = this.props as GlobalState
        const thisAttendeeId = props.thisAttendeeId 
        const attendeeInfo = appState.roster[thisAttendeeId]
        let attendeeName = "no focused"
        let muted = <div/>
        if(attendeeInfo === undefined){
        }else{
            attendeeName = (attendeeInfo.name !== undefined && attendeeInfo.name !== null)? attendeeInfo.name!.substring(0,20) : "unknown"
            muted = attendeeInfo.muted ? (<Icon name="mute"  color="red" />) : (<Icon name="unmute"/>)
        }

        const focusedTileId = getTileId(thisAttendeeId, appState.videoTileStates)
        if(focusedTileId > 0 && this.mainOverlayVideoRef.current !== null){
            gs.meetingSession?.audioVideo.bindVideoElement(focusedTileId, this.mainOverlayVideoRef.current.getVideoRef().current!)
        }

        return(
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                        <div>
                            <MainOverlayVideoElement {...props} ref={this.mainOverlayVideoRef}/>
                        </div>
                        <span>
                            {muted}
                            {attendeeName}
                        </span>
                        <span style={{paddingLeft:"30px"}}>
                            <Icon name="pencil" color={this.state.enableDrawing? "red":"grey"}
                                link onClick ={
                                    ()=>{
                                        this.mainOverlayVideoRef.current!.setDrawingMode(!this.state.enableDrawing)
                                        this.mainOverlayVideoRef.current!.setErasing(false)
                                        this.setState({
                                            enableDrawing:!this.state.enableDrawing,
                                            erasing:false,
                                        })
                                    }
                                }
                            />
                            {this.labelExampleCircular()}
                            <Icon name="eraser" color={this.state.erasing? "red":"grey"}
                                link onClick={
                                    ()=>{
                                        this.mainOverlayVideoRef.current!.setErasing(true)
                                        this.setState({
                                            erasing:true,
                                            enableDrawing:false
                                        })
                                    }
                                } 
                            />
                            <Icon name="file outline" link onClick={()=>{this.mainOverlayVideoRef.current!.clearDrawingCanvas()}} />
                                

                        </span>
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
        let muted = <span/>
        let paused = <span/>
        let focusIcon = <span/>

        if(attendeeInfo === undefined){
        }else{
            attendeeName = (attendeeInfo.name !== undefined && attendeeInfo.name !== null)? attendeeInfo.name!.substring(0,20) : "unknown"
            muted = attendeeInfo.muted ? (<Icon name="mute"  color="red" />) : (<Icon name="unmute"/>)
            
            paused = attendeeInfo.paused ?
             (<Icon name="pause circle outline" color="red" link onClick={()=>{
                props.unpauseVideoTile(thisAttendeeId)
                }} />)
             : 
             (<Icon name="pause circle outline" link onClick={()=>{
                props.pauseVideoTile(thisAttendeeId)
                }} />)
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
                </div>
                <span>
                {muted}
                </span>
                <span>
                {paused}
                </span>
                {focusIcon}
                {attendeeName}
                
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
                <TileScreenTile {...props} thisAttendeeId={attendeeId}/>
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
}

export default LobbyMeetingRoom;

