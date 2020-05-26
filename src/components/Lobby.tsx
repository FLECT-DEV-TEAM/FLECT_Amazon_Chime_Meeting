import * as React from 'react';
import { Button, Form, Grid, GridColumn, Menu } from 'semantic-ui-react'
import LobbyMain from './LobbyMain';

class Lobby extends React.Component {
    render() {
        const props = this.props as any

        return (
            <Grid>
                <Grid.Row>
                    <Grid.Column width={16}>
                        
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <LobbyMain  {...props} />
                    </Grid.Column>
                    
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        
                    </Grid.Column>
                </Grid.Row>

            </Grid>
        )
    }
}

export default Lobby;

