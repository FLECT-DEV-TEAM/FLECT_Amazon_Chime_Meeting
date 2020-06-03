import * as React from 'react';
import { Icon, Dropdown, Grid, Popup } from 'semantic-ui-react';
import { GlobalState } from '../../reducers';
import { AppState } from '../App';

const trigger = (
    <span>
      microphone
    </span>
  )

class MicControl extends React.Component {
    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const inputAudioDevicesOpts=gs.inputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })

        const muteIcon=appState.currentSettings.mute ?
        (
            <Popup
            trigger={
                <Icon.Group link onClick={() => { props.toggleMute() }}>
                    <Icon size="large" color='black' name='microphone' />
                    <Icon size="large" color='red' name='dont' />
                </Icon.Group>        
            }       
            content="unmute."
            />
        )
        :
        (
            <Popup
            trigger={
                <Icon size="large" name="microphone"  color="black" link onClick={() => { props.toggleMute() }}/>
            }
            content="mute."
            />
        )

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column >
                    {muteIcon}
                    <Dropdown
                        style={{paddingLeft:"10px"}}
                        pointing='top left'
                        options={inputAudioDevicesOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectInputAudioDevice(value as string)}
                    />

                        {/* <List style={{paddingLeft:"15px",paddingTop:"0px",paddingBottom:"0px"}} link>
                            <List.Item as='a' active onClick={() => { props.toggleMute() }}><Icon name="ban" color={appState.currentSettings.mute ? "red" : "grey"} />Mute</List.Item>
                        </List>  */}



                    </Grid.Column>
                </Grid.Row>
            </Grid>            


        )
    }
}

export default MicControl;


