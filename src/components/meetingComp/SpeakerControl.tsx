import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';

class SpeakerControl extends React.Component {

    render() {
        const props = this.props as any
        return (
            // @ts-ignore
            <Button.Group color={props.enable ? BUTTON_COLOR : BUTTON_COLOR_DISABLE}>
                <Button size='mini' onClick={() => props.toggleSpeaker() }><Icon name="sound" /></Button>
                <Dropdown
                className='button icon'
                floating
                options={props.outputAudioDevicesOpts}
                trigger={<React.Fragment />}
                onChange={(e, { value }) => props.selectOutputAudioDevice(value as string)}
                />
            </Button.Group>
        )
    }
}

export default SpeakerControl;


