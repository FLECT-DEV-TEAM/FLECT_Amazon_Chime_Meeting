import * as React from 'react';
import { Icon, Button } from 'semantic-ui-react';
import { BUTTON_COLOR } from '../../const';

class ExitControl extends React.Component {

    render() {
        const props = this.props as any
        return (
            // @ts-ignore
            <Button.Group color={BUTTON_COLOR}>
                <Button size='mini' onClick={() => { props.leaveMeeting() }}><Icon name="sign-out" /></Button>
            </Button.Group>
        )
    }
}

export default ExitControl;


