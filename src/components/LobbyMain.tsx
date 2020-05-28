import * as React from 'react';
import { Grid } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
import LobbyRoomList from './LobbyRoomList';
import LobbyMeetingRoom from './LobbyMeetingRoom';
import LobbyUserPanel from './LobbyUserPanel';


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

        let lobbyMainColumnConfig: LobbyMainColumnConfigInf | null = null

        if(gs.windowConfig.leftBarDisplay === true && gs.windowConfig.rightBarDisplay === true){
            lobbyMainColumnConfig = LobbyMainColumnConfig.default
        }else if(gs.windowConfig.leftBarDisplay === true && gs.windowConfig.rightBarDisplay === false){
            lobbyMainColumnConfig = LobbyMainColumnConfig.noUserPanel
        }else if(gs.windowConfig.leftBarDisplay === false && gs.windowConfig.rightBarDisplay === true){
            lobbyMainColumnConfig = LobbyMainColumnConfig.noRoomList
        }else if(gs.windowConfig.leftBarDisplay === false && gs.windowConfig.rightBarDisplay === false){
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
            <Grid padded="horizontally">
                <Grid.Row>
                        {leftColumn}
                        {centerColumn}
                        {rightColumn}
                </Grid.Row>
            </Grid>

            </div>



        )
    }
}

export default LobbyMain;

