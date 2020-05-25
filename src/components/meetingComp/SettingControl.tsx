import * as React from 'react';
import { Icon, Button, Modal, Grid } from 'semantic-ui-react';
import { BUTTON_COLOR } from '../../const';
import { RS_VBG } from '../resources';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';


interface SettingControlState {
    open: boolean,
}

class SettingControl extends React.Component {
    
    state: SettingControlState ={
        open: false,
    }
    settingOpen = () => {
        this.setState({ open: true })
    }
    settingClose = () => {
        this.setState({open: false})
    }
    
    generateSettingModal = () => {
        return (
            <Modal onClose={this.settingClose} open={this.state.open}>
            <Modal.Header>Setting</Modal.Header>
            <Modal.Content>
                <Grid>
                <Grid.Row>
                    Virtual background
                    </Grid.Row>
                <Grid.Row>
                    {this.generateVGSettingPanal()}
                </Grid.Row>
                </Grid>
            </Modal.Content>
            <Button content='Close' negative onClick={this.settingClose} />
            </Modal>
        )
    }
    
    generateVGSettingPanal = () => {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState

        const images = []
        RS_VBG.sort()
        for (const i in RS_VBG) {
            const imgPath = RS_VBG[i]
            images.push(
            <Grid.Column width={4}>
                <div onClick={() => { props.setVirtualBackground(imgPath) }} style={
                (() => {
                    return appState.currentSettings.virtualBackgroundPath === imgPath ?
                    { color: "red", border: "2px solid #ff0000", width: "100%", height: "100%" } :
                    { width: "100%", height: "100%" }
                })()
                }>
                <img src={imgPath} width="100%" height="100%" alt="" />
                </div>
            </Grid.Column>
            )
        }
        return (
            images
        )
    }
    render() {
        return (
          // @ts-ignore
          <Button.Group color={BUTTON_COLOR}>
            <Button size='mini' onClick={() => { this.settingOpen() }}><Icon name="setting" /></Button>
            {this.generateSettingModal()}
          </Button.Group>
        )
    }
}

export default SettingControl;


