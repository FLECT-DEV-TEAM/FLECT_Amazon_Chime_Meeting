import * as React from 'react';
import { Grid, Menu, Dropdown } from 'semantic-ui-react'
import LobbyMain from './LobbyMain';
import { GlobalState } from '../reducers';
import { AppState } from './App';


class LobbyHeader extends React.Component {
    state = {activeItem:""}

    handleItemClick = (v:any) => {
        console.log(v)
        this.setState({ activeItem: v })
    }

    render() {
        //const { activeItem } = this.state
        const props = this.props as any
        const gs = this.props as GlobalState
        return (
            <Menu stackable pointing secondary>
                {/* <Menu.Item>
                    <img src='/logo.png' />
                </Menu.Item> */}

                <Menu.Item as="h4"
                    name='FLECT Meetings with Amazon Chime SDK '
                >
                </Menu.Item>

                <Menu.Item
                    name=' '
                    active={this.state.activeItem === 'testimonials'}
                    onClick={(e,v)=>this.handleItemClick(v)}
                >
                </Menu.Item>

                <Menu.Menu position='right'>
                    <Dropdown item text='View'>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={(e)=>{props.toggleLeftBar()}}>
                                {gs.windowConfig.leftBarDisplay ? "Hide Left Pane": "Show Left Pane"}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={(e)=>{props.toggleRightBar()}}>
                                {gs.windowConfig.rightBarDisplay ? "Hide Right Pane": "Show Right Pane"}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>

                </Menu.Menu>
            </Menu>
        )
    }
}

class Lobby extends React.Component {
    render() {
        const props = this.props as any
        const appState = props.appState as AppState

        if(appState.isSafari){
            const localVideo = document.getElementById("localVideo");
            appState.localVideoElement.setAttribute('playsinline', 'playsinline')
            localVideo!!.appendChild(appState.localVideoElement)
        }
        return (

            <Grid>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <LobbyHeader {...props} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <LobbyMain  {...props} />
                    </Grid.Column>

                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        2020, FLECT CO., LTD. 
                    </Grid.Column>
                </Grid.Row>

            </Grid>
        )
    }
}

export default Lobby;

