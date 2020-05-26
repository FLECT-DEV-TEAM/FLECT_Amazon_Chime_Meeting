import * as React from 'react';
import { Icon, Button, Accordion} from 'semantic-ui-react';
import { BUTTON_COLOR} from '../../const';
import { AppState } from '../App';


interface VideoShareControlState{
    open             : boolean
}


class VideoShareControl extends React.Component {
    state: VideoShareControlState = {
        open             : false,
    }
    handleClick() {
        this.setState({open: !this.state.open})
    }
    fileInputRef = React.createRef<HTMLInputElement>()

    generateAccordion = () =>{
        const props = this.props as any
        const appState = props.appState as AppState
    
        const grid = (
            <Accordion styled>
                <Accordion.Title
                    active={this.state.open}
                    index={0}
                    onClick={()=>{this.handleClick()}}
                >
                    <Icon name='dropdown' />
                    Video Share
                </Accordion.Title>
                <Accordion.Content active={this.state.open}>


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


                </Accordion.Content>
            </Accordion>
        )
        return grid
      }
    
    
      render() {
        return this.generateAccordion()
      }


}

export default VideoShareControl;


