import * as React from 'react';
import { Accordion, Icon, Grid } from 'semantic-ui-react';
import { RS_STAMPS } from '../resources';
import { AppState } from '../App';

interface StampAccordionState{
    open             : boolean
}

class StampAccordion extends React.Component {
  state: StampAccordionState = {
    open             : false,
  }

  handleClick() {
    this.setState({open: !this.state.open})
  }


  ////////////////////////////////
  /// UI
  ///////////////////////////////
  generateAccordion = () =>{
    const grid = (
        <Accordion>
        <Accordion.Title
            active={this.state.open}
            index={0}
            onClick={()=>{this.handleClick()}}
        >
            <Icon name='dropdown' />
            Stamps
        </Accordion.Title>
        <Accordion.Content active={this.state.open}>
            {this.generateStampTiles()}
        </Accordion.Content>
        </Accordion>
    )
    return grid
  }

  generateStampTiles = () => {

    const props = this.props as any
    const appState = props.appState as AppState
    const stamps = []
    for (const i in RS_STAMPS) {
      const imgPath = RS_STAMPS[i]

      stamps.push(
            <img src={imgPath} width="10%" alt="" onClick={(e) => { props.sendStamp(appState.joinedMeetings, appState.joinedMeetings[appState.focusedMeeting].focuseAttendeeId, imgPath) }} />
      )
    }
    return (
      <Grid divided='vertically'>
        <Grid.Row >
          <Grid.Column width={16} >
            {stamps}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  render() {
    return this.generateAccordion()
  }

}

export default StampAccordion;

