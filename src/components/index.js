import React, {Component} from 'react'
import KeyHandler, { KEYPRESS } from 'react-key-handler'

import AnnotationHandler from './AnnotationHandler'
import MasterPanel from './MasterPanel'
import Navbar from './Navbar'
import styled from 'styled-components'


const AppContainer = styled.div`
    display:flex;
`

const PanelContainer = styled.div`
    flex:3;
`
const AnnotationHandlerContainer = styled.div`
    flex:9;
`

class AnnotationApp extends Component{
    constructor(props){
        super(props)
        this.state = {
            hdrLevel: 1,
        }
    }

    incrementHeaderLevel= (event) => {
        event.preventDefault();

        const hdrLvl = this.state.hdrLevel;
        this.setState({hdrLevel: (hdrLvl + 1)});

    };

    decrementHeaderLevel= (event) => {
        event.preventDefault();
        const hdrLvl = this.state.hdrLevel;
        if(hdrLvl > 1)
            this.setState({hdrLevel: (hdrLvl - 1)});

    };

    render() {
        const keys = {"Select previous section":"q",
            "Select next section":"a",
            "Split selected text":"s",
            "Hide section":"r",
            "Undo change":"u",
            "Increment header level":"h",
            "Toggle header":"j",
            "Decrement header level": "k",
            "Toggle paragraph":"p"
            }
        
        let annotHandler = <AnnotationHandler Keys={keys} hdrLevel={this.state.hdrLevel}/>
        return (
            <>
                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={keys['Decrement header level']}
                    onKeyHandle={this.decrementHeaderLevel}
                />

                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={keys['Increment header level']}
                    onKeyHandle={this.incrementHeaderLevel}
                />
                <Navbar></Navbar>
                <AppContainer>
                    <PanelContainer>
                        <MasterPanel Keys={keys} hdrLevel={this.state.hdrLevel}></MasterPanel>
                    </PanelContainer>
                    <AnnotationHandlerContainer>
                        {annotHandler}
                    </AnnotationHandlerContainer>
                </AppContainer>

                <Navbar sticky='top'></Navbar>
                <AppContainer>
                    <PanelContainer>
                        <MasterPanel Keys={keys} hdrLevel={this.state.hdrLevel}></MasterPanel>
                    </PanelContainer>
                    <AnnotationHandlerContainer>
                        {annotHandler}
                    </AnnotationHandlerContainer>
                </AppContainer>
            </>
        )
    }
}

export default AnnotationApp;
