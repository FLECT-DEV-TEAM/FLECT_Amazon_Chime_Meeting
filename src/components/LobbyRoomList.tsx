import * as React from 'react';
import { Button, Form, Grid, GridColumn, Modal, Segment, Label, Feed, Header, Item, Menu, Dropdown, Divider, Checkbox, CheckboxProps } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
class LobbyRoomList extends React.Component {
    roomNameRef        = React.createRef<HTMLInputElement>()
    roomSecretCheckRef = React.createRef<React.Component<CheckboxProps, any, any>>()
    roomPassCodeRef    = React.createRef<HTMLInputElement>()

    state = { open: false, secretRoomCreateChecked:false}
    show =  () => this.setState({ open: true })
    close = () => this.setState({ open: false })
    createMeeting = () =>{
        const roomName     = this.roomNameRef.current!.value
        const roomPassCode = this.roomPassCodeRef.current!.value
        const check        = this.state.secretRoomCreateChecked
        console.log(roomName, roomPassCode, check)
        this.close()
    }

    render() {
        const gs = this.props as GlobalState
        const props = this.props as any

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
                                <Checkbox label='Secret?' checked={this.state.secretRoomCreateChecked} ref={this.roomSecretCheckRef}
                                    onClick={()=>{this.setState({ secretRoomCreateChecked: !this.state.secretRoomCreateChecked })}}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Pass Code</label>
                                <input placeholder='pass' ref={this.roomPassCodeRef}/>
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
                            </Header>
                        </Divider>                        
                        <div>
                            <Item.Group>
                                <Item>
                                    <Item.Image size='mini' src='/images/wireframe/image.png' />
                                    <Item.Content>
                                        <Item.Header>CI2020</Item.Header>
                                        <Item.Meta>
                                            <span className='stay'>2020/05/23-</span>
                                        </Item.Meta>
                                    </Item.Content>
                                </Item>

                                <Item>
                                    <Item.Image size='mini' src='/images/wireframe/image.png' />
                                    <Item.Content>
                                        <Item.Header>CI2020</Item.Header>
                                        <Item.Meta>
                                            <span className='stay'>2020/05/23-</span>
                                        </Item.Meta>
                                    </Item.Content>
                                </Item>
                                <Item>
                                    <Item.Image size='mini' src='/images/wireframe/image.png' />
                                    <Item.Content>
                                        <Item.Header>CI2020</Item.Header>
                                        <Item.Meta>
                                            <span className='stay'>2020/05/23-</span>
                                        </Item.Meta>
                                    </Item.Content>
                                </Item>
                            </Item.Group>                            

                        </div>
                    </Segment>
                </div>
            </div>
        )
    }
}

export default LobbyRoomList;

