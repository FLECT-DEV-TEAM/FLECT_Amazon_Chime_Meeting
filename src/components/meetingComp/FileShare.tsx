import * as React from 'react';
import { Icon, Accordion, List } from 'semantic-ui-react';
import { AppState } from '../App';


interface FileShareControlState{
    open             : boolean
}


class FileShareControl extends React.Component {
    state: FileShareControlState = {
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
            <Accordion>
                <Accordion.Title
                    active={this.state.open}
                    index={0}
                    onClick={()=>{this.handleClick()}}
                >
                    <Icon name='dropdown' />
                    ShareFile
                </Accordion.Title>
                <Accordion.Content active={this.state.open}>
                    <div style={{paddingLeft:"10px"}}>
                        <List link>
                            <List.Item as='a' active onClick={() => this.fileInputRef.current!.click()}>
                                <Icon name="folder"  active />Choose file.
                            </List.Item>
                        </List>
                    </div>

                    <input
                            ref={this.fileInputRef}
                            type="file"
                            hidden
                            onChange={(e) => props.sharedFileSelected(appState.currentSettings.focuseAttendeeId, e)}
                        />
                </Accordion.Content>
            </Accordion>
        )
        return grid
      }
    
    
      render() {
        return this.generateAccordion()
      }


}

export default FileShareControl;


