import * as React from 'react';
import { Icon, Accordion, List, Progress } from 'semantic-ui-react';
import { AppState } from '../App';
import { NO_FOCUSED } from '../../const';



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

    sendingStatus = () =>{
        const props = this.props as any
        const appState = props.appState as AppState
        if(appState.focusedMeeting !== NO_FOCUSED){
            const statuses = appState.joinedMeetings[appState.focusedMeeting].fileTransferStatus.sendingStatusStatuses.map(s =>{
                const allNum   = s.partNum
                const num      = s.transferredIndex
                const percent  = Math.ceil((num / allNum) * 100)
                const filename = s.filename
                if (s.done){
                    return(<div/>)
                }
                return(
                    <div>
                        Sending({filename}) <Progress percent={percent} indicating />
                    </div>
                )
            })
            return statuses
        }
    }

    receivingStatus = () =>{
        const props = this.props as any
        const appState = props.appState as AppState
        if(appState.focusedMeeting !== NO_FOCUSED){

            const statuses = appState.joinedMeetings[appState.focusedMeeting].fileTransferStatus.recievingStatuses.map(s =>{
                const allNum   = s.partNum
                const num      = s.recievedIndex
                const percent  = Math.ceil((num / allNum) * 100)
                const filename = s.filename
                if (s.available){
                    return(<div/>)
                }
                return(
                    <div>
                        Receiving({filename}) <Progress percent={percent} indicating />
                    </div>
                )
            })
            return statuses
        }
    }

    
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
                            onChange={(e) => props.sharedFileSelected(appState.focusedMeeting, appState.joinedMeetings[appState.focusedMeeting].focusAttendeeId, e)}
                        />
                    {this.sendingStatus()}
                    {this.receivingStatus()}

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


