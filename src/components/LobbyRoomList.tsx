import * as React from 'react';
import { Button, Form, Grid, GridColumn, Modal, Segment, Label, Feed, Header, Item, Menu, Dropdown, Divider, Checkbox, CheckboxProps, Icon } from 'semantic-ui-react'
import { GlobalState, MeetingInfo } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
class LobbyRoomList extends React.Component {
    roomNameRef        = React.createRef<HTMLInputElement>()
    roomSecretCheckRef = React.createRef<React.Component<CheckboxProps, any, any>>()
    roomPassCodeRef    = React.createRef<HTMLInputElement>()

    state = { open: false, secretRoomCreateChecked:false, usePasscodeChecked:false}
    show =  () => this.setState({ open: true })
    close = () => this.setState({ open: false })
    createMeeting = () =>{
        const props = this.props as any
        const gs = this.props as GlobalState
        const roomName      = this.roomNameRef.current!.value
        const roomPassCode  = this.roomPassCodeRef.current!.value
        const secretCheck   = this.state.secretRoomCreateChecked
        const passcodeCheck = this.state.usePasscodeChecked

        const roomRegion    = 'ap-northeast-1' //TBD 可変にする
        
        console.log(roomName, roomPassCode, secretCheck, passcodeCheck)
        props.createMeeting(gs.userName, roomName, roomRegion, passcodeCheck, roomPassCode, secretCheck)
        this.close()
    }

    render() {
        const gs = this.props as GlobalState
        const props = this.props as any

        const meetings = gs.meetings.map((meeting:MeetingInfo)=>{
            let joinLabel
            let currentMeetingId
            if(gs.joinInfo===null){
                currentMeetingId = null
            }else{
                currentMeetingId = gs.joinInfo.Meeting.MeetingId ? gs.joinInfo.Meeting.MeetingId : null
            }
            if(currentMeetingId === meeting.meetingId){
                joinLabel = (
                    <Label basic color='red' onClick={()=>{
                        console.log("CLICK LEAVE", meeting.meetingId)
                        props.leaveMeeting(meeting.meetingId, gs.joinInfo?.Attendee.AttendeeId)
                    }}>
                        leave
                    </Label>
                )
            }else if(currentMeetingId === null){
                joinLabel = (
                    <Label basic color='teal' onClick={()=>{
                        console.log("CLICK JOIN", meeting.meetingId)
                        props.joinMeeting(meeting.meetingId, gs)
                    }}>
                        join
                    </Label>
                )
            }else{
                joinLabel = (
                    <Label basic color='grey' >
                        join
                    </Label>
                )
            }
            return (
                <Item>
                    {/* <Item.Image size='mini' src='/' /> */}
                    <Item.Content>
                        <Item.Header>
                            <Grid>
                                <Grid.Row>
                                    <Grid.Column width={8}>
                                        {meeting.meetingName}
                                    </Grid.Column>
                                    <Grid.Column width={8}>
                                        {joinLabel}
                                    </Grid.Column>                                    
                                </Grid.Row>
                            </Grid>
                        </Item.Header>
                        <Item.Meta>
                            <span className='stay'> Owner: {meeting.metaData.OwnerId} </span>
                        </Item.Meta>
                    </Item.Content>
                </Item>
            )
        })


        return (
            <div>
                <div>

                <Modal dimmer={'blurring'} size={'small'} open={this.state.open} onClose={this.close}>
                    <Modal.Header>Create New Meeting</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <label>Room Name</label>
                                <input placeholder='name' ref={this.roomNameRef}/>
                            </Form.Field>
                            <Form.Field>
                                <Checkbox label='Use Passcode?(not implement)' checked={this.state.usePasscodeChecked}
                                    onClick={()=>{this.setState({ usePasscodeChecked: !this.state.usePasscodeChecked })}}
                                />
                                <label>Pass Code(not implement)</label>
                                <input placeholder='pass' ref={this.roomPassCodeRef}/>
                            </Form.Field>
                            <Form.Field>
                            <Checkbox label='Secret?(not implement)' checked={this.state.secretRoomCreateChecked}
                                    onClick={()=>{this.setState({ secretRoomCreateChecked: !this.state.secretRoomCreateChecked })}}
                                />
                            </Form.Field>
                        </Form>

                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.close}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Create' onClick={this.createMeeting}/>
                    </Modal.Actions>
                </Modal>
                </div>
                <div>
                    <Segment padded>
                        <Divider horizontal>
                            <Header as='h3' textAlign={'left'}>
                                Actions
                            </Header>
                        </Divider>                        
                        <Menu vertical >
                            <Dropdown item text='Action' >
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={(e, d)=>{this.show()}} >New Meeting</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Menu>


                        <Divider horizontal>
                            <Header as='h3' textAlign={'left'}>
                                Meetings
                                <span />
                                <Label basic color='red' onClick={()=>{props.refreshRoomList()}}>
                                    <Icon name='refresh' />
                                    refresh
                                </Label>
                            </Header>
                            
                        </Divider>                        
                        <div>
                            <Item.Group>
                                {meetings}

                            </Item.Group>                            

                        </div>
                    </Segment>
                </div>
            </div>
        )
    }
}

export default LobbyRoomList;

