import React, {Component} from 'react';
import styled from 'styled-components';


const PanelContainer = styled.div`
    background:LightGrey
`
const KeysContainer = styled.div`
    font-size:1.2em;
    text-align:left;
`

const HeaderLevelContainer = styled.div`
    font-size:1.4em;
`


//Could have done this as a functional component
class MasterPanel extends Component{
    constructor(props){
        super(props);
    }


    render(){
        let keyList = "Loading"
        if(this.props.Keys){
            const ObjKeys = Object.keys(this.props.Keys);
            keyList = ObjKeys.map((key,index) => (
                <KeysContainer key={index}>{`${key} : ${this.props.Keys[key]}`}</KeysContainer>
            ))
        }
        return(
            <>
            <PanelContainer>
                <HeaderLevelContainer>Current Header Level is:  {this.props.hdrLevel}</HeaderLevelContainer>
                <div> { keyList} </div>              
            </PanelContainer>
            </>

        )
    }
}

export default MasterPanel;

