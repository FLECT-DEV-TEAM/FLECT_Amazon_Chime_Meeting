import * as React from 'react';
import { Button, Form } from 'semantic-ui-react'
import { GlobalState } from '../reducers';

class Entrance extends React.Component {
    roomIDRef   = React.createRef<HTMLInputElement>()
    userNameRef = React.createRef<HTMLInputElement>()
    regionRef   = React.createRef<HTMLInputElement>()
    enter=()=>{
        console.log(this.roomIDRef.current!.value)
        const props      = this.props as any
        const gs         = this.props as GlobalState
        const roomID     = this.roomIDRef.current!.value
        const userName   = this.userNameRef.current!.value
        const region     = this.regionRef.current!.value

        props.enterSession(gs.baseURL, roomID, userName, region)
    }

    render() {
        return (
          <div style={{ width: "60%", height: "100%",  margin: "auto"}}>
            <Form>
              <Form.Field>
                <label>Room ID</label>
                <input placeholder='room ID' ref={this.roomIDRef} />
              </Form.Field>
              <Form.Field>
                <label>User Name</label>
                <input placeholder='name' ref={this.userNameRef}/>
              </Form.Field>
              <Form.Field>
                <label>Region</label>
                <input placeholder='region' disabled value='us-east-1' ref={this.regionRef}/>
              </Form.Field>
              <Button type='submit' onClick={()=>this.enter()}>Submit</Button>
          </Form>
          </div>
        )
    }
}

export default Entrance;

