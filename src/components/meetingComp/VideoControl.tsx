import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

class VideoControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const inputVideoDevicesOpts=gs.inputVideoDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })
        return (
            // @ts-ignore
            <Button.Group color={appState.currentSettings.videoEnable ? BUTTON_COLOR : BUTTON_COLOR_DISABLE}>
                <Button size='mini' onClick={() => { props.toggleVideo() }}><Icon name="video camera" /></Button>
                <Dropdown
                className='button icon'
                floating
                options={inputVideoDevicesOpts}
                trigger={<React.Fragment />}
                onChange={(e, { value }) => props.selectInputVideoDevice(value as string)}
                />
            </Button.Group>
        )
    }
}

export default VideoControl;


