import * as React from 'react';
import { Icon, Accordion, Menu, Divider, List, Label} from 'semantic-ui-react';


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
    
        const grid = (
            <Accordion>
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
                        <Label basic as="a" icon="play" 
                            onClick={(e) => { props.playSharedVideo() }}
                        />
                        <Label basic as="a" icon="pause" 
                            onClick={(e) => { props.pauseSharedVideo() }}
                        />
                        <Label basic as="a" icon="stop" 
                            onClick={(e) => { props.pauseSharedVideo() }}
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

export default VideoShareControl;


