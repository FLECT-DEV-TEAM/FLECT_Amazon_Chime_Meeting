import * as React from 'react';
import { Grid, Menu, Icon, Label } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { AppStatus, ForegroundPosition, ForegroundSize, VirtualForegroundType} from '../const'
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
        
        const thisAttendeeId = props.thisAttendeeId as string
        const thisMeetingId  = props.thisMeetingId as string
        const attendeeInfo = appState.joinedMeetings[thisMeetingId].roster[thisAttendeeId]
        let attendeeName = "no focused"
        //let meetingShortId = thisMeetingId.substr(0,5)
        const meetingName = gs.meetings.filter((x)=>{return x.meetingId === thisMeetingId})[0].meetingName
        

        let muted = <div/>
        if(attendeeInfo === undefined){
        }else{
            attendeeName = (attendeeInfo.name !== undefined && attendeeInfo.name !== null)? attendeeInfo.name!.substring(0,20) : "unknown"
            muted = attendeeInfo.muted ? (<Icon name="mute"  color="red" />) : (<Icon name="unmute"/>)
        }

        const focusedTileId = getTileId(thisAttendeeId, appState.joinedMeetings[thisMeetingId].videoTileStates)
        if(focusedTileId > 0 && this.mainOverlayVideoRef.current !== null){
            if(appState.joinedMeetings[thisMeetingId].videoTileStates[focusedTileId].localTile){
                const videoElement = this.mainOverlayVideoRef.current.getVideoRef().current!
                appState.joinedMeetings[thisMeetingId].meetingSession?.audioVideo.bindVideoElement(focusedTileId, videoElement)
                videoElement.style.setProperty('-webkit-transform', 'scaleX(1)');
                videoElement.style.setProperty('transform', 'scaleX(1)');
            }else{
                appState.joinedMeetings[thisMeetingId].meetingSession?.audioVideo.bindVideoElement(focusedTileId, this.mainOverlayVideoRef.current.getVideoRef().current!)
            }
        }else{
            console.log("not focusedid", focusedTileId, this.mainOverlayVideoRef.current)
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
                            {attendeeName} @ {meetingName}
                        </span>

                        <span style={{paddingLeft:"10px"}}>
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


                        <span style={{paddingLeft:"10px"}}>
                            <Icon basic link name="long arrow alternate left"  size="large"
                                onClick={() => {
                                    props.setForegroundPosition(ForegroundPosition.BottomLeft)
                                }}
                            />
                            <Icon basic link name="long arrow alternate right"  size="large"
                                onClick={() => {
                                    props.setForegroundPosition(ForegroundPosition.BottomRight)
                                }}
                            />
                            <Icon basic link name="square outline"  size="large"
                                onClick={() => {
                                    props.setForegroundSize(ForegroundSize.Full)
                                }}
                            />
                            <Icon basic link name="expand"  size="large"
                                onClick={() => {
                                    props.setForegroundSize(ForegroundSize.Large)
                                }}
                            />
                            <Icon basic link name="compress"  size="large"
                                onClick={() => {
                                    props.setForegroundSize(ForegroundSize.Small)
                                }}
                            />
                        </span>
                        
                        <span style={{paddingLeft:"10px"}}>
                            <Label as="a" onClick={() => { props.setVirtualForeground(VirtualForegroundType.None) }} >
                                <Icon name="square outline" size="large"/>
                                None
                            </Label> 
                            <Label as="a" onClick={() => { props.setVirtualForeground(VirtualForegroundType.Canny) }} >
                                <Icon name="chess board" size="large"/>
                                canny
                            </Label> 
                            <Label as="a" onClick={() => { props.setVirtualForeground(VirtualForegroundType.Ascii) }} >
                                <Icon name="font" size="large"/>
                                ascii
                            </Label> 
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

        const thisAttendeeId = props.thisAttendeeId as string
        const thisMeetingId  = props.thisMeetingId as string
        const attendeeInfo = appState.joinedMeetings[thisMeetingId].roster[thisAttendeeId]
        let attendeeName = "loading...."
        //let meetingShortId = thisMeetingId.substr(0,5)
        const meetingName = gs.meetings.filter((x)=>{return x.meetingId === thisMeetingId})[0].meetingName
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
            focusIcon = thisAttendeeId === appState.joinedMeetings[thisMeetingId].focusAttendeeId ? (<Icon name="eye"  color="red" />) : (<span />)

        }


        const thisTileId = getTileId(thisAttendeeId, appState.joinedMeetings[thisMeetingId].videoTileStates)
        if(thisTileId > 0 && this.tileOverlayVideoRef.current !== null){
            if(appState.joinedMeetings[thisMeetingId].videoTileStates[thisTileId].localTile){
                const videoElement = this.tileOverlayVideoRef.current.getVideoRef().current!
                appState.joinedMeetings[thisMeetingId].meetingSession?.audioVideo.bindVideoElement(thisTileId, videoElement)
                videoElement.style.setProperty('-webkit-transform', 'scaleX(1)');
                videoElement.style.setProperty('transform', 'scaleX(1)');
            }else{
                appState.joinedMeetings[thisMeetingId].meetingSession?.audioVideo.bindVideoElement(thisTileId, this.tileOverlayVideoRef.current.getVideoRef().current!)
            }
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
                {attendeeName} @ {meetingName}
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

    message = () => {
        console.log("message cunsume!")
    }

    render() {
        this.id2ref = {}
        const gs = this.props as GlobalState
        const props = this.props as any
        const appState = props.appState as AppState
        if(gs.status !== AppStatus.IN_MEETING){
            return(<div />)
        }

        // for(let key in appState.videoTileStates){
        //     const attendeeId = appState.videoTileStates[key].boundAttendeeId
        //     const tileId = appState.videoTileStates[key].tileId
        //     const tmpRef = React.createRef<MainOverlayVideoElement>()
        //     this.id2ref[tileId!] = tmpRef
        //     const cell = (
        //         <TileScreenTile {...props} thisAttendeeId={attendeeId}/>
        //     )
        //     this.cells.push(cell)
        // }

        const mainScreens:JSX.Element[]=[]
        if(this.state.showMainScreen===true){
            for(let key in appState.joinedMeetings){
                const focusAttendeeId = appState.joinedMeetings[key].focusAttendeeId
                const meetingId = key
                mainScreens.push(
                    <MainScreen {...props} thisAttendeeId={focusAttendeeId} thisMeetingId={meetingId} />
                )
            }
        }

        const tiles:JSX.Element[]=[]
        if(this.state.showTileScreen === true){
            for(let meetingId in appState.joinedMeetings){
                const tileStates = appState.joinedMeetings[meetingId].videoTileStates
                for(let tileId in tileStates){
                    const attendeeId = tileStates[tileId].boundAttendeeId
                    const tmpRef = React.createRef<MainOverlayVideoElement>()
                    this.id2ref[tileId] = tmpRef
                    const cell = (
                        <TileScreenTile {...props} thisAttendeeId={attendeeId} thisMeetingId={meetingId} />
                    )
                    tiles.push(cell)
                }
            }
        }

        return (
            <div>

                <Menu stackable  secondary>
                    {/* <Menu.Item as="h2"
                        name={gs.joinInfo?.MeetingName}
                    >
                    </Menu.Item> */}
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
                            {mainScreens}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row >
                            {tiles}
                    </Grid.Row>
                </Grid>
            </div>
        )

    }
}

export default LobbyMeetingRoom;

