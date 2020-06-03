import * as React from 'react';
import { Icon, Accordion, Label} from 'semantic-ui-react';

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

        const grid = (
            <Accordion>
                <Accordion.Title
                    active={this.state.open}
                    index={0}
                    onClick={()=>{this.handleClick()}}
                >
                    <Icon name='dropdown' />
                    Display Share
                </Accordion.Title>
                <Accordion.Content active={this.state.open}>
                    <div style={{paddingLeft:"10px"}}>
                        <Icon basic link name="play" 
                            onClick={() => { props.sharedDisplaySelected()}}
                        />
                        <Icon basic link name="stop" 
                            onClick={() => { props.stopSharedDisplay() }}
                        />                        
                    </div>

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


