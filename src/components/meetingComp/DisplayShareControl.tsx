import * as React from 'react';
import { Icon, Button} from 'semantic-ui-react';
import { BUTTON_COLOR} from '../../const';

class DisplayShareControl extends React.Component {
    fileInputRef = React.createRef<HTMLInputElement>()

    render() {
        const props = this.props as any
        return (
            <Button.Group color={BUTTON_COLOR}>
                <Button
                content="share screen"
                labelPosition="left"
                icon="desktop"
                onClick={() => { props.sharedDisplaySelected()}}
                />
                <Button size='mini' onClick={() => { props.stopSharedDisplay() }}><Icon name="stop" /></Button>
            </Button.Group>
        )
    }
}

export default DisplayShareControl;


