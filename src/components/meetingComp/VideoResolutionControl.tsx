import * as React from 'react';
import { Icon, Dropdown, Grid, List, Popup } from 'semantic-ui-react';
import { AppState } from '../App';
import { GlobalState } from '../../reducers';

const trigger = (
    <span>
      <Icon name="expand"/> video Resolution
    </span>
  )


class VideoResolutionControl extends React.Component {

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const appState = props.appState as AppState
        const inputVideoResolutionsOpts=gs.inputVideoResolutions!.map(info => { return { key: info, text: info, value: info } })

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column>
                    
                    <Dropdown
                        pointing='top left'
                        options={inputVideoResolutionsOpts}
                        trigger={trigger}
                        onChange={(e, { value }) => props.selectInputVideoResolution(value as string)}
                    />
                    </Grid.Column>
                </Grid.Row>

            </Grid>

        )
    }
}

export default VideoResolutionControl;


