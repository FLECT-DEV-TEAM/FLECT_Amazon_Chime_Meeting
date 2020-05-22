import * as React from 'react';
import { Button, Form, Grid, GridColumn } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
class LobbyMeetingRoom extends React.Component {
    render() {
        const gs = this.props as GlobalState
        const props = this.props as any

        return (
            <div>LobbyMeetingRoom</div>
        )
    }
}

export default LobbyMeetingRoom;

