import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

class SpeakerControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const outputAudioDevicesOpts=gs.outputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
        return (
            // @ts-ignore
            <Button.Group color={appState.currentSettings.speakerEnable ? BUTTON_COLOR : BUTTON_COLOR_DISABLE}>
                <Button size='mini' onClick={() => props.toggleSpeaker() }><Icon name="sound" /></Button>
                <Dropdown
                className='button icon'
                floating
                options={outputAudioDevicesOpts}
                trigger={<React.Fragment />}
                onChange={(e, { value }) => props.selectOutputAudioDevice(value as string)}
                />
            </Button.Group>
        )
    }
}

export default SpeakerControl;


