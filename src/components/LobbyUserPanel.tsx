import * as React from 'react';
import { Button, Form, Grid, GridColumn, Segment, Header, Card, Icon, Image, Divider } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
import { LobbyMainColumnConfig, LobbyMainColumnConfigInf} from '../const'
import VideoControl from './meetingComp/VideoControl';
import MicControl from './meetingComp/MicControl';
import SpeakerControl from './meetingComp/SpeakerControl';
import VideoShareControl from './meetingComp/VideoShareControl';
import DisplayShareControl from './meetingComp/DisplayShareControl';
import SettingControl from './meetingComp/SettingControl';
import StampAccordion from './meetingComp/StampAccordion';
import SendTextAccordion from './meetingComp/SendTextAccordion';
import { AppState } from './App';
import SecondaryCameraAccordion from './meetingComp/SecondaryCameraAccordion';
import StampAccordionBySignal from './meetingComp/StampAccordionBySignal';


interface PreviewPanelState{
    open             : boolean
}

class PreviewPanel extends React.Component {
    previewCanvasRef = React.createRef<HTMLCanvasElement>()

    state: PreviewPanelState = {
        open             : true,
    }
    handleClick() {
        this.setState({open: !this.state.open})
    }

    componentDidMount = () =>{
        requestAnimationFrame(() => this.drawPreviewCanvas())
    }

    drawPreviewCanvas =() => {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState

        if(appState.inputVideoCanvas2 !== undefined && this.previewCanvasRef.current !== null){
            if(this.previewCanvasRef.current!.width   !== 0 && this.previewCanvasRef.current!.height !== 0 &&
                appState.inputVideoCanvas2.width !== 0 && appState.inputVideoCanvas2.height !== 0
                ){
                    const orgWidth  = appState.inputVideoStream?.getVideoTracks()[0].getSettings().width!
                    const orgHeight = appState.inputVideoStream?.getVideoTracks()[0].getSettings().height!

                    this.previewCanvasRef.current!.width  = this.previewCanvasRef.current!.scrollWidth
                    this.previewCanvasRef.current!.height = (this.previewCanvasRef.current!.width/orgWidth) * orgHeight

                const ctx = this.previewCanvasRef.current!.getContext("2d")!
                ctx.drawImage(appState.inputVideoCanvas2, 0, 0, this.previewCanvasRef.current!.scrollWidth,this.previewCanvasRef.current!.scrollHeight)
            }
        }
        requestAnimationFrame(() => this.drawPreviewCanvas())
    }
    render(){
        const gs = this.props as GlobalState
        return(
            <div>
                {this.state.open ?
                    (
                        <div>
                        {/* <Segment>
                            <div >
                                <Button basic icon="angle up" size="tiny" width="100%" compact onClick={()=>{this.handleClick()}} />
                            </div>

                            <canvas ref={this.previewCanvasRef} style={{ display: "block" }} width="100%" height="100%" />
                        </Segment> */}

                        <Card width="100%">
                        <Button basic icon="angle up" size="tiny" compact onClick={()=>{this.handleClick()}} />
                        <canvas ref={this.previewCanvasRef} style={{ display: "block" }} width="100%" height="100%" />
                        <Card.Content>
                            <Card.Header>{gs.userName} </Card.Header>
                            <Card.Meta>xxx@xxx.xcom</Card.Meta>
                            <Card.Description>
                                xxxxx
                            </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            xxxxxx
                        </Card.Content>
                        </Card>
                        </div>
                    )
                    :
                    (
                        <div>
                            {/* <Segment padded>
                            <Button basic icon="angle down" size="tiny"  compact onClick={()=>{this.handleClick()}} />
                            </Segment> */}

                        <Card  >
                        <Button basic icon="angle down" size="tiny"  compact onClick={()=>{this.handleClick()}} />
                        </Card>
                        </div>

                    )

                }
            </div>
        )
    }

}



interface ConfigurationPanelState{
    open             : boolean
}

class ConfigurationPanel extends React.Component {
    previewCanvasRef = React.createRef<HTMLCanvasElement>()

    state: ConfigurationPanelState = {
        open             : true,
    }
    handleClick() {
        this.setState({open: !this.state.open})
    }

    render (){
        const gs = this.props as GlobalState
        const props = this.props as any
        return(
            <div>
                <Segment padded>

                    <Header as='h3' textAlign={'left'}> Configurations </Header>
                    <p>
                        <MicControl {...props} />
                    </p>
                    <p>
                        <VideoControl {...props} />
                    </p>
                    <p>
                        <SpeakerControl {...props} />
                    </p>
                    <p>
                        <SettingControl {...props}/>
                    </p>

                    <Header as='h3' textAlign={'left'}> Actions </Header>
                    <VideoShareControl {...props} />
                    <DisplayShareControl {...props} />
                    <StampAccordion {...props} />
                    <SendTextAccordion {...props}/>

                    <SecondaryCameraAccordion {...props} />
                    <StampAccordionBySignal {...props} />
                </Segment>
            </div>
        )
    }
}


class LobbyUserPanel extends React.Component {


    render() {
        const gs = this.props as GlobalState
        const props = this.props as any
        const appState = props.appState as AppState

        return (
            <div  style={{padding:"10px"}}>
                <PreviewPanel  {...props}/>

                <Divider hidden />

                <ConfigurationPanel {...props} />


            </div>
        )
    }
}

export default LobbyUserPanel;

