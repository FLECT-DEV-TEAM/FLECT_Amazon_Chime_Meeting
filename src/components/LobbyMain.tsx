import * as React from 'react';
import { Button, Form, Grid, GridColumn, Sidebar, Menu, Icon, Segment, Header, Image, Label } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf, AppStatus, AppMeetingStatus, LOGGER_BATCH_SIZE, LOGGER_INTERVAL_MS} from '../const'
import LobbyRoomList from './LobbyRoomList';
import LobbyMeetingRoom from './LobbyMeetingRoom';
import LobbyUserPanel from './LobbyUserPanel';
import { MeetingSessionConfiguration, DefaultMeetingSession, Logger, LogLevel, ConsoleLogger, DefaultDeviceController, MeetingSessionPOSTLogger } from 'amazon-chime-sdk-js';




const VerticalSidebar = ( animation:any, direction:any, visible:any ) => (
    <Sidebar
      as={Menu}
      animation={animation}
      direction={direction}
      icon='labeled'
      inverted
      vertical
      visible={visible}
      width='thin'
    >
      <Menu.Item as='a'>
        <Icon name='home' />
        Home
      </Menu.Item>
      <Menu.Item as='a'>
        <Icon name='gamepad' />
        Games
      </Menu.Item>
      <Menu.Item as='a'>
        <Icon name='camera' />
        Channels
      </Menu.Item>
    </Sidebar>
  )

class LobbyMain extends React.Component {

    state = {
        animation: 'overlay',
        direction: 'left',
        dimmed: false,
        visible: false,
      }

    handleAnimationChange = (animation:any) => () =>
      this.setState((prevState:any) => ({ animation, visible: !prevState.visible }))
  
    handleDimmedChange = (e:any, checked:any ) => this.setState({ dimmed: checked })
  
    handleDirectionChange = (direction:any) => () =>
      this.setState({ direction, visible: false })



      
  
    render() {
        const gs = this.props as GlobalState
        const props = this.props as any
        const { animation, dimmed, direction, visible } = this.state


        let lobbyMainColumnConfig: LobbyMainColumnConfigInf | null = null

        if(gs.windowConfig.leftBarDisplay === true && gs.windowConfig.rigntBarDisplay === true){
            lobbyMainColumnConfig = LobbyMainColumnConfig.default
        }else if(gs.windowConfig.leftBarDisplay === true && gs.windowConfig.rigntBarDisplay === false){
            lobbyMainColumnConfig = LobbyMainColumnConfig.noUserPanel
        }else if(gs.windowConfig.leftBarDisplay === false && gs.windowConfig.rigntBarDisplay === true){
            lobbyMainColumnConfig = LobbyMainColumnConfig.noRoomList
        }else if(gs.windowConfig.leftBarDisplay === false && gs.windowConfig.rigntBarDisplay === false){
            lobbyMainColumnConfig = LobbyMainColumnConfig.mainOnly
        }

        

        // @ts-ignore
        const leftColumn   = lobbyMainColumnConfig!.left   === 0 ? <div/> : <Grid.Column width={lobbyMainColumnConfig!.left}>   <LobbyRoomList  {...props}/>    </Grid.Column>
        // @ts-ignore
        const centerColumn = lobbyMainColumnConfig!.center === 0 ? <div/> : <Grid.Column width={lobbyMainColumnConfig!.center}> <LobbyMeetingRoom  {...props}/> </Grid.Column>
        // @ts-ignore
        const rightColumn  = lobbyMainColumnConfig!.right  === 0 ? <div/> : <Grid.Column width={lobbyMainColumnConfig!.right}>  <LobbyUserPanel  {...props}/>   </Grid.Column>


        return (
            <div>
                {/* <Label onClick={(e)=>{
                    this.handleDirectionChange('left');
                    this.handleAnimationChange('scale down');
                    console.log("CLICK")
                }}> aaaaaa </Label> */}
            <Grid>
                <Grid.Row>
                        {leftColumn}
                        {centerColumn}
                        {rightColumn}
                </Grid.Row>
            </Grid>

{/* 
            <Sidebar.Pushable as={Segment}>
  
                <VerticalSidebar
                animation={animation}
                direction={direction}
                visible={visible}
                />

                <Sidebar.Pusher dimmed={dimmed && visible}>
                    <Segment basic>
                    <Header as='h3'>Application Content</Header>
                    <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
                    </Segment>
                </Sidebar.Pusher>
                </Sidebar.Pushable> */}
            </div>



        )
    }
}

export default LobbyMain;

