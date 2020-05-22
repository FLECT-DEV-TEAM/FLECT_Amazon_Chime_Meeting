import * as React from 'react';
import { Button, Form, Grid, GridColumn } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
import LobbyRoomList from './LobbyRoomList';
import LobbyMeetingRoom from './LobbyMeetingRoom';
import LobbyUserPanel from './LobbyUserPanel';
class LobbyMain extends React.Component {
    render() {
        const gs = this.props as GlobalState
        const props = this.props as any

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
            <Grid>
                <Grid.Row>
                        {leftColumn}
                        {centerColumn}
                        {rightColumn}
                </Grid.Row>
            </Grid>
        )
    }
}

export default LobbyMain;

