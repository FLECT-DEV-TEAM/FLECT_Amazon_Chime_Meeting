import * as React from 'react';
import { Button, Form, Modal, Segment, Header, Item, Divider, Checkbox, CheckboxProps, Icon, List } from 'semantic-ui-react'
import { GlobalState, MeetingInfo } from '../reducers';
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
            let joinButton
            let currentMeetingId

            currentMeetingId = gs.joinInfo?.Meeting.MeetingId ? gs.joinInfo.Meeting.MeetingId : null


            if(currentMeetingId === meeting.meetingId){
                joinButton = (
                    <Button basic color="red" floated='right'
                        onClick={()=>{
                                console.log("CLICK LEAVE", meeting.meetingId)
                                props._leaveMeeting(meeting.meetingId, gs.joinInfo?.Attendee.AttendeeId)
                            }}                    
                    >
                        leave
                        <Icon name='chevron left' />
                    </Button>
                )
            }else if(currentMeetingId === null){
                joinButton = (
                    <Button basic color="teal" floated='right'
                        onClick={()=>{
                                console.log("CLICK JOIN", meeting.meetingId)
                                props._joinMeeting(meeting.meetingId, gs)
                            }}>                    
                        join
                        <Icon name='chevron right' />
                    </Button>

                )
            }else{
                // in other meetings, so join is disabled
                joinButton = (
                    <Button basic color="grey" floated='right' disabled>
                        join
                        <Icon name='chevron right' />
                    </Button>

                )
            }
            return (
                <Item>
                    {/* <Item.Image size='mini' src='/' /> */}
                    <Item.Content>

                        <Item.Header>
                            <Icon name="lock open" />
                            {meeting.meetingName}
                        </Item.Header>
                        <Item.Meta>
                            <div>
                                <b>Owner: </b> 
                                {meeting.metaData.UserName} 
                            </div>
                            <div>
                                <b>Open Date: </b> 
                                <span>{new Date(Number(meeting.metaData.StartTime)).toLocaleDateString()}</span>
                                <span>{new Date(Number(meeting.metaData.StartTime)).toLocaleTimeString()}</span>
                            </div>
                        </Item.Meta>
                        <Item.Extra>
                            {joinButton}
                        </Item.Extra>
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
                            <Header as='h2' textAlign="left">
                                Lobby
                            </Header>
                        </Divider>
                        <Header as='h3' textAlign="left">
                            Actions
                        </Header>
                        <List link>
                            <List.Item as='a' active onClick={(e, d)=>{this.show()}}>
                                <Header as='h5' textAlign={'left'}>
                                    <Icon name="chat"  active />New Meeting!
                                </Header>
                            </List.Item>
                            <List.Item as='a' active onClick={()=>{props.refreshRoomList()}}>
                                <Header as='h5' textAlign={'left'}>
                                    <Icon name="refresh"  active />Refresh Meeting List
                                </Header>
                            </List.Item>

                        </List>

                        <Divider hidden />


                        <Header as='h3' textAlign="left">
                            Meetings
                        </Header>
  
                        <div>
                            <Item.Group >
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

