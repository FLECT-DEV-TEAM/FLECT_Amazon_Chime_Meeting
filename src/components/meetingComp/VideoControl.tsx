import * as React from 'react';
import { Icon, Button, Dropdown, Grid, GridRow, GridColumn, List } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

const trigger = (
    <span>
      <Icon name="video camera" />video camera
    </span>
  )


class VideoControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const inputVideoDevicesOpts=gs.inputVideoDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                    <Dropdown
                        pointing='top left'
                        options={inputVideoDevicesOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectInputVideoDevice(value as string)}
                    />
                        <List style={{paddingLeft:"15px",paddingTop:"0px",paddingBottom:"0px"}} link>
                            <List.Item as='a' active onClick={() => { props.toggleVideo() }}><Icon name="ban" color={appState.currentSettings.videoEnable ? "grey" : "red"}/>Disable Camera</List.Item>
                        </List> 
                    </Grid.Column>
                </Grid.Row>

            </Grid>

        )
    }
}

export default VideoControl;


