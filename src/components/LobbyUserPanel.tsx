import * as React from 'react';
import { Button, Form, Grid, GridColumn, Segment, Header, Card, Icon, Image } from 'semantic-ui-react'
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

class LobbyUserPanel extends React.Component {
    previewCanvasRef = React.createRef<HTMLCanvasElement>()

    componentDidMount = () =>{
        requestAnimationFrame(() => this.drawPreviewCanvas())
    }

    drawPreviewCanvas =() => {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState

        if(appState.inputVideoCanvas2 !== undefined){
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

    render() {
        const gs = this.props as GlobalState
        const props = this.props as any
        const appState = props.appState as AppState

        return (
            <div>

                <Card>
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

                </Segment>


            </div>
        )
    }
}

export default LobbyUserPanel;

