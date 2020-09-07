import React, {Component} from 'react';
import styled from 'styled-components';
import T from 'prop-types';

const AnnotationContainer = styled.div`
    display:flex;
    background: ${(props) => props.selected ? "white" : "LightGrey"};
`

const TextContainer = styled.div`
    flex:12;
    text-align:left;
    color: ${(props) => props.selected ? "black" : "grey"};
`
const LabelContainer = styled.div`
    flex:1;
    text-align:left;
    color: ${(props) => props.selected ? "black" : "grey"};
`

const Divider = styled.div`
    border-style:solid;
    border-color:grey;
    text-align:center;
    cursor:pointer;
    background:LightGrey;
`



//Could have done this as a functional component
class Annotation extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <>
            <AnnotationContainer 
                selected = {this.props.selected}
                onMouseUp = {this.props.onMouseUp}>
                <LabelContainer selected={this.props.selected}>Label: {this.props.annotation}</LabelContainer>
                <TextContainer selected={this.props.selected}>{this.props.text}</TextContainer>
            </AnnotationContainer>
            <Divider onClick={this.props.dividerOnClick}>Merge</Divider>
            </>
        )
    }
}

export default Annotation;

