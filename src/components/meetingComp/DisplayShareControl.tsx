import * as React from 'react';
import { Icon, Button, Accordion} from 'semantic-ui-react';
import { BUTTON_COLOR} from '../../const';
import { AppState } from '../App';
interface DisplayShareControlState{
    open             : boolean
}


class DisplayShareControl extends React.Component {
    state: DisplayShareControlState = {
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
                    Display Share
                </Accordion.Title>
                <Accordion.Content active={this.state.open}>
                    <Button.Group color={BUTTON_COLOR}>
                        <Button
                        content="share screen"
                        labelPosition="left"
                        icon="desktop"
                        onClick={() => { props.sharedDisplaySelected()}}
                        />
                        <Button size='mini' onClick={() => { props.stopSharedDisplay() }}><Icon name="stop" /></Button>
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

export default DisplayShareControl;


