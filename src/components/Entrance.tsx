import * as React from 'react';
import { Button, Form } from 'semantic-ui-react'

class Entrance extends React.Component {
    userNameRef = React.createRef<HTMLInputElement>()
    codeRef   = React.createRef<HTMLInputElement>()
    login=()=>{
        const props      = this.props as any
        const userName   = this.userNameRef.current!.value
        const code       = this.codeRef.current!.value

        props.createUser(userName, code)
        
    }

    render() {
        return (
          <div style={{ width: "60%", height: "100%",  margin: "auto"}}>
            <Form>
              <Form.Field>
                <label>User Name</label>
                <input placeholder='name' ref={this.userNameRef}/>
              </Form.Field>
              <Form.Field>
                <label>Code</label>
                <input placeholder='code' ref={this.codeRef}/>
              </Form.Field>
              <Button type='submit' onClick={()=>this.login()}>Submit</Button>
            </Form>
          </div>
        )
    }
}

export default Entrance;

