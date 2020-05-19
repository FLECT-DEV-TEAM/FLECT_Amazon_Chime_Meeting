import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';

class MicControl extends React.Component {
    render() {
        const props = this.props as any
        return (
            // @ts-ignore
            <Button.Group color={props.mute ? BUTTON_COLOR_DISABLE : BUTTON_COLOR}>
                <Button size='mini' onClick={() => { props.toggleMute() }} ><Icon name="microphone" /></Button>
                <Dropdown
                    className='button icon'
                    floating
                    options={props.inputAudioDevicesOpts}
                    trigger={<React.Fragment />}
                    onChange={(e, { value }) => props.selectInputAudioDevice(value as string)}
                />
            </Button.Group>
        )
    }
}

export default MicControl;


