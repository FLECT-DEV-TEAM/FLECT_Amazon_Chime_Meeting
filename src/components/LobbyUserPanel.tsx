import * as React from 'react';
import { Button, Card, Divider, Icon } from 'semantic-ui-react'
import { GlobalState } from '../reducers';
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
import FileShareControl from './meetingComp/FileShare';
import VideoResolutionControl from './meetingComp/VideoResolutionControl';


interface PanelState{
    open             : boolean
}

class PreviewPanel extends React.Component {
    previewCanvasRef = React.createRef<HTMLCanvasElement>()

    state: PanelState = {
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
       const appState = props.appState as AppState

        if(this.previewCanvasRef.current !== null){
            if(appState.localVideoEffectors.outputWidth !== 0 && appState.localVideoEffectors.outputHeight !== 0){
                
                this.previewCanvasRef.current!.width  = this.previewCanvasRef.current!.scrollWidth
                this.previewCanvasRef.current!.height = (this.previewCanvasRef.current!.width/appState.localVideoEffectors.outputWidth) * appState.localVideoEffectors.outputHeight
                const ctx = this.previewCanvasRef.current!.getContext("2d")!
                ctx.drawImage(appState.localVideoEffectors.outputCanvas, 0, 0, this.previewCanvasRef.current!.width, this.previewCanvasRef.current!.height)
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
                        <Card width="100%">
                            <Button basic size="tiny"  compact onClick={()=>{this.handleClick()}} >
                                {/* <Header as='h5'> */}
                                    <Icon name="angle up" />Preview
                                {/* </Header> */}
                            </Button>
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
                        <Card  >
                            <Button basic size="tiny"  compact onClick={()=>{this.handleClick()}} >
                                {/* <Header as='h5'> */}
                                    <Icon name="angle down" />Preview
                                {/* </Header> */}
                            </Button>
                        </Card>
                        </div>

                    )

                }
            </div>
        )
    }
}

class ConfigPanel extends React.Component {
    previewCanvasRef = React.createRef<HTMLCanvasElement>()

    state: PanelState = {
        open             : true,
    }
    handleClick() {
        this.setState({open: !this.state.open})
    }

    render(){
        const props = this.props as any
        return(
            <div>
                {this.state.open ?
                    (
                        <div>

                        <Card width="100%">
                            <Button basic size="tiny"  compact onClick={()=>{this.handleClick()}} >
                                {/* <Header as='h5'> */}
                                    <Icon name="angle up" />Configurations
                                {/* </Header> */}
                            </Button>                            
                            <Card.Content>
                                <p>
                                    <MicControl {...props} />
                                </p>
                                <p>
                                    <VideoControl {...props} />
                                </p>
                                <p>
                                    <SpeakerControl {...props} />
                                </p>
                                <Divider />
                                <p>
                                    <VideoResolutionControl {...props} />
                                </p>
                                <p>
                                    <SettingControl {...props}/>
                                </p>
                            </Card.Content>
                        </Card>
                        </div>
                    )
                    :
                    (
                        <div>
                        <Card  >
                            <Button basic size="tiny"  compact onClick={()=>{this.handleClick()}} >
                                {/* <Header as='h5'> */}
                                    <Icon name="angle down" />Configurations
                                {/* </Header> */}
                            </Button>
                        </Card>
                        </div>

                    )

                }
            </div>
        )
    }
}




class ActionsPanel extends React.Component {
    previewCanvasRef = React.createRef<HTMLCanvasElement>()

    state: PanelState = {
        open             : true,
    }
    handleClick() {
        this.setState({open: !this.state.open})
    }

    render(){
        const props = this.props as any
        return(
            <div>
                {this.state.open ?
                    (
                        <div>

                        <Card width="100%">
                            <Button basic size="tiny"  compact onClick={()=>{this.handleClick()}} >
                                {/* <Header as='h5'> */}
                                    <Icon name="angle up" />Actions
                                {/* </Header> */}
                            </Button>                            
                            <Card.Content>
                                <VideoShareControl {...props} />
                                <DisplayShareControl {...props} />
                                <StampAccordion {...props} />
                                <SendTextAccordion {...props}/>

                                <SecondaryCameraAccordion {...props} />
                                <StampAccordionBySignal {...props} />


                                <FileShareControl {...props} />
                            </Card.Content>
                        </Card>
                        </div>
                    )
                    :
                    (
                        <div>
                        <Card  >
                            <Button basic size="tiny"  compact onClick={()=>{this.handleClick()}} >
                                {/* <Header as='h5'> */}
                                    <Icon name="angle down" />Actions
                                {/* </Header> */}
                            </Button>
                        </Card>
                        </div>

                    )

                }
            </div>
        )
    }
}











class LobbyUserPanel extends React.Component {


    render() {
        const props = this.props as any

        return (
            <div  style={{padding:"10px"}}>
                <PreviewPanel  {...props}/>
                <Divider hidden />

                <ConfigPanel {...props} />
                <Divider hidden />

                <ActionsPanel {...props} />

            </div>
        )
    }
}

export default LobbyUserPanel;

