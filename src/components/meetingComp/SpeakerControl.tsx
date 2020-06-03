import * as React from 'react';
import { Icon, Dropdown, Grid, List, Popup } from 'semantic-ui-react';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

const trigger = (
    <span>
     speaker
    </span>
  )


class SpeakerControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const outputAudioDevicesOpts=gs.outputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })

        const enableIcon=appState.currentSettings.speakerEnable ?
        (
            <Popup
            trigger={
                <Icon size="large" name="sound"  color="black" link onClick={() => { props.toggleSpeaker() }}/>
            }
            content="disable."
            />
        )
        :
        (
            <Popup
            trigger={
                <Icon.Group link onClick={() => { props.toggleSpeaker() }}>
                    <Icon size="large" color='black' name='sound' />
                    <Icon size="large" color='red' name='dont' />
                </Icon.Group>        
            }       
            content="enable."
        />
        )

        return (

            <Grid>
                <Grid.Row>
                    <Grid.Column >
                    {enableIcon}
                    <Dropdown
                        style={{paddingLeft:"10px"}}
                        pointing='top left'
                        options={outputAudioDevicesOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectOutputAudioDevice(value as string)}
                    />
                        {/* <List style={{paddingLeft:"15px",paddingTop:"0px",paddingBottom:"0px"}} link>
                            <List.Item as='a' active onClick={() => { props.toggleSpeaker() }}><Icon name="ban" color={appState.currentSettings.speakerEnable ? "grey" : "red"}/>Disable Speaker</List.Item>
                        </List>  */}


                    </Grid.Column>
                </Grid.Row>
            </Grid>

        )
    }
}

export default SpeakerControl;


