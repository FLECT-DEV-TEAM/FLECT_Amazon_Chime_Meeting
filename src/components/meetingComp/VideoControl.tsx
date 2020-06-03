import * as React from 'react';
import { Icon, Dropdown, Grid, List, Popup } from 'semantic-ui-react';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

const trigger = (
    <span>
      video camera
    </span>
  )


class VideoControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const inputVideoDevicesOpts=gs.inputVideoDevices!.map(info => { return { key: info.label, text: info.label, value: info.deviceId } })

        const enableIcon=appState.currentSettings.videoEnable ?
        (
            <Popup
            trigger={
                <Icon size="large" name="video camera"  color="black" link onClick={() => { props.toggleVideo() }}/>
            }
            content="disable."
            />
        )
        :
        (
            <Popup
            trigger={
                <Icon.Group link onClick={() => { props.toggleVideo() }}>
                    <Icon size="large" color='black' name='video camera' />
                    <Icon size="large" color='red' name='dont' />
                </Icon.Group>        
            }       
            content="enable."
        />
        )
        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>

                    {enableIcon}
                    
                    <Dropdown
                        style={{paddingLeft:"10px"}}
                        pointing='top left'
                        options={inputVideoDevicesOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectInputVideoDevice(value as string)}
                    />
                        {/* <List style={{paddingLeft:"15px",paddingTop:"0px",paddingBottom:"0px"}} link>
                            <List.Item as='a' active onClick={() => { props.toggleVideo() }}><Icon name="ban" color={appState.currentSettings.videoEnable ? "grey" : "red"}/>Disable Camera</List.Item>
                        </List>  */}
                    </Grid.Column>
                </Grid.Row>

            </Grid>

        )
    }
}

export default VideoControl;


