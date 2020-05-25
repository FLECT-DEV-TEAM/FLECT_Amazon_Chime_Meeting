import * as React from 'react';
import { Button, Form, Grid, GridColumn } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
import VideoControl from './meetingComp/VideoControl';
import MicControl from './meetingComp/MicControl';
import SpeakerControl from './meetingComp/SpeakerControl';
import VideoShareControl from './meetingComp/VideoShareControl';
import DisplayShareControl from './meetingComp/DisplayShareControl';
class LobbyUserPanel extends React.Component {
    render() {
        const gs = this.props as GlobalState
        const props = this.props as any


        return (
            <div>
                <MicControl {...props} />
                <VideoControl {...props} />
                <SpeakerControl {...props} />
                <VideoShareControl {...props} />
                <DisplayShareControl {...props} />
            </div>
        )
    }
}

export default LobbyUserPanel;

