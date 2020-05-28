import * as React from 'react';
import { Icon, Dropdown, Grid, List } from 'semantic-ui-react';
import { GlobalState } from '../../reducers';
import { AppState } from '../App';

const trigger = (
    <span>
      <Icon name="microphone" />microphone
    </span>
  )

class MicControl extends React.Component {
    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        console.log("MIC", props)
        const inputAudioDevicesOpts=gs.inputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column >
                    <Dropdown
                        pointing='top left'
                        options={inputAudioDevicesOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectInputAudioDevice(value as string)}
                    />

                        <List style={{paddingLeft:"15px",paddingTop:"0px",paddingBottom:"0px"}} link>
                            <List.Item as='a' active onClick={() => { props.toggleMute() }}><Icon name="ban" color={appState.currentSettings.mute ? "red" : "grey"} />Mute</List.Item>
                        </List> 



                    </Grid.Column>
                </Grid.Row>
            </Grid>            


        )
    }
}

export default MicControl;


