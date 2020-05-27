import * as React from 'react';
import { Icon, Button, Accordion, Menu, Form, Divider, List} from 'semantic-ui-react';
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
                    <div>
                        {/* <Button compact basic 
                            content="select file."
                            labelPosition="left"
                            icon="folder"
                            onClick={() => this.fileInputRef.current!.click()}
                        /> */}
                        <input
                            ref={this.fileInputRef}
                            type="file"
                            hidden
                            onChange={(e) => props.sharedVideoSelected(e)}
                        />

                        <List link>
                            <List.Item as='a' active onClick={() => this.fileInputRef.current!.click()}>
                                <Icon name="folder"  active />Choose file.
                            </List.Item>
                        </List>
                    </div>



                    <Divider hidden />
                    <div>
                        <Menu compact size="tiny">
                            <Menu.Item
                            icon="play"
                            key="play"
                            name="play"
                            color="grey"
                            onClick={(e) => { props.playSharedVideo() }}
                            
                            />
                            <Menu.Item
                            icon="pause"
                            key="pause"
                            name="pause"
                            color="grey"
                            onClick={(e) => { props.pauseSharedVideo() }}
                            />
                            <Menu.Item
                            icon="stop"
                            key="stop"
                            name="stop"
                            color="grey"
                            disabled
                            onClick={()=>{console.log("clicked")}}
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

export default VideoShareControl;


