import * as React from 'react';
import { Icon, Button} from 'semantic-ui-react';
import { BUTTON_COLOR} from '../../const';

class VideoShareControl extends React.Component {
    fileInputRef = React.createRef<HTMLInputElement>()

    render() {
        const props = this.props as any
        return (
            <Button.Group color={BUTTON_COLOR}>
                <Button
                    content="share movie"
                    labelPosition="left"
                    icon="film"
                    onClick={() => this.fileInputRef.current!.click()}
                />
                <input
                    ref={this.fileInputRef}
                    type="file"
                    hidden
                    onChange={(e) => props.sharedVideoSelected(e)}
                />
                <Button size='mini' onClick={(e) => { props.playSharedVideo() }} ><Icon name="play" /></Button>
                <Button size='mini' onClick={(e) => { props.pauseSharedVideo() }}><Icon name="pause" /></Button>
            </Button.Group>
        )
    }
}

export default VideoShareControl;


