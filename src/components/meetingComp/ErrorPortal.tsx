import * as React from 'react';
import { Button, Portal, Segment, Header } from 'semantic-ui-react';
import { GlobalState } from '../../reducers';

class ErrorPortal extends React.Component {
    state = { open: false }

    handleClose = () => {
        const props = this.props as any
        props.closeError()
    }

    render() {
        const gs = this.props as GlobalState
        return (

              <Portal onClose={this.handleClose} open={true}>
                <Segment
                  style={{
                    left: '40%',
                    position: 'fixed',
                    top: '50%',
                    zIndex: 1000,
                  }}
                >
                  <Header>Error</Header>
                  <p>
                    {gs.errorMessage}
                  </p>

                  <Button
                    content='Close Portal'
                    negative
                    onClick={this.handleClose}
                  />
                </Segment>
              </Portal>
        )
    }
}

export default ErrorPortal;


