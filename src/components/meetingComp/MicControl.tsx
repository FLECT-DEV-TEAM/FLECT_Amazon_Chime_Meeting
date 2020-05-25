import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';
import { GlobalState } from '../../reducers';
import { AppState } from '../App';

class MicControl extends React.Component {
    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        console.log("MIC", props)
        const inputAudioDevicesOpts=gs.inputAudioDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
        return (
            // @ts-ignore
            <Button.Group color={appState.currentSettings.mute ? BUTTON_COLOR_DISABLE : BUTTON_COLOR}>
                <Button size='mini' onClick={() => { props.toggleMute() }} ><Icon name="microphone" /></Button>
                <Dropdown
                    className='button icon'
                    floating
                    options={inputAudioDevicesOpts}
                    trigger={<React.Fragment />}
                    onChange={(e, { value }) => props.selectInputAudioDevice(value as string)}
                />
            </Button.Group>
        )
    }
}

export default MicControl;


