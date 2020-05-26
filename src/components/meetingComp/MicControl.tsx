import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';
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
            <Dropdown
                pointing='top left'
                options={inputAudioDevicesOpts}
                trigger={trigger}
                onChange={(e, { value }) => props.selectInputAudioDevice(value as string)}
            />
        )
    }
}

export default MicControl;


