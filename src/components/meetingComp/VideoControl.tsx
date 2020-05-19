import * as React from 'react';
import { Icon, Button, Dropdown } from 'semantic-ui-react';
import { BUTTON_COLOR, BUTTON_COLOR_DISABLE } from '../../const';

class VideoControl extends React.Component {

    render() {
        const props = this.props as any
        return (
            // @ts-ignore
            <Button.Group color={props.enable ? BUTTON_COLOR : BUTTON_COLOR_DISABLE}>
                <Button size='mini' onClick={() => { props.toggleVideo() }}><Icon name="video camera" /></Button>
                <Dropdown
                className='button icon'
                floating
                options={props.inputVideoDevicesOpts}
                trigger={<React.Fragment />}
                onChange={(e, { value }) => props.selectInputVideoDevice(value as string)}
                />
            </Button.Group>
        )
    }
}

export default VideoControl;


