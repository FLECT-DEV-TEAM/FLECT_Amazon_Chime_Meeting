import * as React from 'react';
import { Icon, Button, Dropdown, Grid } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

const trigger = (
    <span>
      <Icon name="sound" />speaker
    </span>
  )


class SpeakerControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const outputAudioDevicesOpts=gs.outputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
        return (

            <Grid>
                <Grid.Row>
                    <Grid.Column width={10}>
                    <Dropdown
                        pointing='top left'
                        options={outputAudioDevicesOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectOutputAudioDevice(value as string)}
                    />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Button basic compact size="tiny" 
                        color={appState.currentSettings.speakerEnable ? "grey" : "red"}
                        onClick={() => { props.toggleSpeaker() }}>
                            disable
                        </Button>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

        )
    }
}

export default SpeakerControl;


