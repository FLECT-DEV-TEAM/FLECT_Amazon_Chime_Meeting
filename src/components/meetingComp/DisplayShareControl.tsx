import * as React from 'react';
import { Icon, Accordion, Menu} from 'semantic-ui-react';

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
                    <div>
                        <Menu compact size="tiny">
                            <Menu.Item
                            icon="play"
                            key="play"
                            name="play"
                            color="grey"
                            onClick={() => { props.sharedDisplaySelected()}}
                            />
                            <Menu.Item
                            icon="stop"
                            key="stop"
                            name="stop"
                            color="grey"
                            onClick={() => { props.stopSharedDisplay() }}
                            />
                        </Menu>
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


