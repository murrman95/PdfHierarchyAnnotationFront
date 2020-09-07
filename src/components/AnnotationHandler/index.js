// Class is basically is the interface between the json blocks, the user, the intelligence, and the api. 
import React, {Component} from 'react'
import T from 'prop-types'
import styled from 'styled-components'
import KeyHandler, { KEYPRESS } from 'react-key-handler'

import Annotation from '../Annotation'
import Stack from '../Utils'




const Container = styled.div`
padding: 8px 16px;
border: 1px gray;
  box-shadow: 0px 0px 1px 1px white inset;
  box-sizing: border-box;
  transition: box-shadow 0.21s ease-in-out;
`


class AnnotationHandler extends Component{
    
    constructor(props){
        super(props);
        //id is saved so we can later write annotations to the backend
        this.state = {
            id : undefined,
            selectedIdx: 1,
            annotations : undefined,
            numBlocks : 1,
            selectedText: "",
            history : new Stack(5)
        }
    }
    
    componentDidMount() {
        fetch('http://localhost:3000/pdfjson/next')
        .then(res => res.json())
        .then(data => this.setState({id:data['base_name']},() =>
            fetch(`http://localhost:3000/json/${this.state.id}`)
            .then(res => res.json())
            .then(res => this.setState({annotations : res['paragraphs'], numBlocks : Object.keys(res.paragraphs).length}))
        ));
    }
    
    
    splitSelect = (index) => ()  =>{
        this.setState({selectedText:window.getSelection().toString(), selectedIdx:index});

    }
    
    //getting coords of string literal 
    getMatch = (query,text) => {
        const textLength = text.length;
        const queryLength = query.length;
        for(var i=0; i < textLength - queryLength; i ++) {
            if(query === text.substring(i,i + queryLength))
                return i;
        }
        return -1;
    }

    isWithin = (first,last) => (number) =>{
        //If num is equal to last, then it's the end of that line and doesn't start a new one
        //
        if ((number >= first) && (number < last))
            return true
        else
            return false
    }

    splitSection = (elementsBefore,elementsAfter,annot,selectedStart,selectedEnd,newLines,numNewLines) => {
        
        //Just change text and bounding box information
        //This is an easy trick for deep cloning. Only works when you have simple datatypes in your JSON object (only strings and numbers)
        let annot1 = JSON.parse(JSON.stringify(annot));
        let annot2 = JSON.parse(JSON.stringify(annot));
        let annot3 = JSON.parse(JSON.stringify(annot));
        
        console.log(JSON.stringify(annot));

        const originalHeight = annot['paragraph']['height'];
        const originalWidth = annot['paragraph']['width'];
        const originalY = annot['paragraph']['y_coord'];
        //x doesn't change
        const originalX = annot['paragraph']['x_coord'];

        const originalTop = originalY - 0.5*(originalHeight);
        const originalBottom = originalY + 0.5*(originalHeight);


        //newTop,newBot are for the middle bounding box.
        const newTop = originalTop + (newLines[0]/numNewLines)*(originalHeight);
        const newBottom = originalTop + (newLines[numNewLines-1]/numNewLines+1)*(originalHeight);

        const text = annot['paragraph']['text'];
        console.log(`stringsplit 1 is ${text.substring(0,selectedStart)}`)
        console.log(`stringsplit 2 is ${text.substring(selectedStart,selectedEnd)}`)
        console.log(`stringsplit 3 is ${text.substring(selectedEnd,text.length)}`)
        annot1['paragraph']['y_coord'] = (originalTop + newTop)/2;
        annot1['paragraph']['height'] = newTop - originalTop;
        annot1['paragraph']['text'] = text.substring(0,selectedStart);

        annot2['paragraph']['y_coord'] = (newBottom + newTop)/2; 
        annot2['paragraph']['height'] = newBottom - newTop;
        annot2['paragraph']['text'] = text.substring(selectedStart,selectedEnd);

        annot3['paragraph']['y_coord'] = (newBottom + originalBottom)/2;                          
        annot3['paragraph']['height'] = originalBottom - newBottom;
        annot3['paragraph']['text'] = text.substring(selectedEnd);

        let newAnnots = []

        newAnnots.push(...elementsBefore);

        //inCase you split the very first of the block
        if(annot1['paragraph']['text'] !== '')
            newAnnots.push(annot1);
        newAnnots.push(annot2);

        //Incase you split the very end of the block
        if(annot3['paragraph']['text'] !== '')
            newAnnots.push(annot3);
        newAnnots.push(...elementsAfter);
        
        for(let j = 0; j < newAnnots.length; j ++){
            newAnnots[j]['paragraph_number']=j;
        } 
        return newAnnots;//this.setState({annotations:newAnnots,numBlocks:newAnnots.length})
    }


    splitCallback = (event) => {
        event.preventDefault()
        const selectedText = this.state.selectedText;
        if(selectedText){
            const annots = this.state.annotations;
            let hist = this.state.history;
            hist.push(annots);


            const idx = this.state.selectedIdx;
            const divText = this.state.annotations[idx]['paragraph']['text'];
            const divTextFiltered = divText.replace(/(\r\n|\n|\r)/gm, " ");


            let newLineIdxs = []

            // NewLine regexp
            var nRegexp = /\n/g;

            let match = null;
            while ((match = nRegexp.exec(divText))!= null){
                //To get the position of the newLine where it would be in the filtered text.
                newLineIdxs.push(match.index - newLineIdxs.length);
            }
            
            console.log(`NewLineIdxs are ${newLineIdxs}`)
            

            const selectedStart = this.getMatch(selectedText,divTextFiltered);
            if(selectedStart != -1){
                const selectedEnd = selectedStart + selectedText.length;

                console.log(`start is ${selectedStart}, end is ${selectedEnd}`);
                var isWithinSelected = this.isWithin(selectedStart,selectedEnd);
                
                //Indexing here starts at 1 for some reason
                const newLines = newLineIdxs.map((nlIdx,index) => isWithinSelected(nlIdx)? index : undefined).filter(x=>x);

                const elementsBefore = annots.map((annot,index) => index < idx ? annot : undefined).filter(x => x)
                const elementsAfter = annots.map((annot,index) => index >=  (idx + 1) ? annot : undefined).filter(x => x)
                const annotToSplit = annots[idx]
                const newAnnots = this.splitSection(elementsBefore,elementsAfter,annotToSplit,selectedStart,selectedEnd,newLines,newLineIdxs.length);

                this.setState({annotations:newAnnots,history:hist})
            }
            else{
                console.log("Selection Matching failed");
                console.log(`SelectedText is ${selectedText}\n`);
                console.log(`FilteredDivText is ${divTextFiltered}\n\n`);

            }
        }
    }



    //Annotations have json structure like 
    /*"paragraph": {
                "block_height": 8.0,
                "block_width": 177.60006713867188,
                "font_size": 8.0,
                "labels": [],
                "num_chars": 34,
                "num_pages": 3.0,
                "num_words": 6,
                "page_height": 801.6461181640625,
                "page_number": 1.0,
                "page_width": 566.7340087890625,
                "percent_bold": 0.0,
                "percent_italics": 0.0,
                "percent_normal": 1.0,
                "text": "JSLS-96-125 3/29/06 8:12 PM Page 1",
                "type_prediction": "MET_BIB_INFO",
                "x_coord": 39.0,
                "y_coord": 8.895751953125
            },
            "paragraph_number": 0
    */

    mergeBoundingBoxes = (annot1, annot2) => {
        const a1 = annot1;
        const a2 = annot2;

        const a1Left = a1['x_coord'] - a1['width'];
        const a1Right = a1['x_coord'] + a1['width'];
        const a1Top = a1['y_coord'] - a1['height'];
        const a1Bottom = a1['x_coord'] - a1['width'];

        const a2Left = a2['x_coord'] - a2['width'];
        const a2Right = a2['x_coord'] + a2['width'];
        const a2Top = a2['y_coord'] - a2['height'];
        const a2Bottom = a2['x_coord'] - a2['width'];

        //Page pixel coordinates are [0,0] in the top-left of the page.
        const newTop = a1Top < a2Top? a1Top : a2Top;
        const newBottom = a1Bottom > a2Bottom? a1Bottom : a2Bottom;
        const newRight = a1Right > a2Right? a1Right : a2Right;
        const newLeft = a1Left < a2Left? a1Left: a2Left;
        
        const newX = (newRight+newLeft)/2;
        const newY = (newTop+newBottom)/2;
        
        const newHeight = (newBottom - newTop);
        const newWidth = (newRight - newLeft);


        const res = {'x_coord' : newX,
            'y_coord': newY,
            'width': newWidth,
            'height': newHeight
        }

        return res;

    }

    //Using curried function so which indices to merge are defined when
    //the merge div is delcared
    mergeWrapper = idx => () => {
            const numBlocks = this.state.numBlocks;
            if (idx < numBlocks){
                let annots = this.state.annotations;
                let hist = this.state.history;
                hist.push(annots);
                const annot1 = annots[idx]['paragraph'];
                const targetIdx = this.getNextIdx(idx);
                const annot2 = annots[targetIdx]['paragraph'];
                // function returns new bounding box given 2 annotations
                const newBB = this.mergeBoundingBoxes(annot1,annot2);

                const newText = `${annot1['text']}\n${annot2['text']}`;
                const newNumWords = annot1['num_words'] + annot2['num_words'];
                const percentBold = annot1['mum_words']*annot1['percent_bold']/newNumWords + annot2['mum_words']*annot2['percent_bold']/newNumWords;

                const percentItalics = annot1['mum_words']*annot1['percent_italics']/newNumWords + annot2['mum_words']*annot2['percent_italics']/newNumWords;
                const percentNormal = 1. - (percentBold + percentItalics);
                
                //filter(x => x) removes undefined because it's falsey
                const elementsBefore = annots.map((annot,index) => index < idx ? annot : undefined).filter(x => x)
                const elementsAfter = annots.map((annot,index) => index >  (targetIdx) ? annot : undefined).filter(x => x)
                const elementsInBetween = annots.map((annot,index) => ((index <  targetIdx) & (index > idx)) ? annot : undefined).filter(x => x)
                const newFontSize = annot1['mum_words']*annot1['font_size']/newNumWords + annot2['mum_words']*annot2['font_size']/newNumWords;
                const res = {"paragraph": {
                        "block_height": newBB['height'],
                        "block_width": newBB['width'],
                        "font_size": newFontSize,
                        "labels": [],
                        "num_chars": newText.length,
                        "num_pages": annot1['num_pages'],
                        "num_words": newNumWords,
                        "page_height": annot1['page_height'],
                        "page_number": annot1['page_number'],
                        "page_width": annot1['page_width'],
                        "percent_bold": percentBold,
                        "percent_italics": percentItalics,
                        "percent_normal": percentNormal,
                        "text": newText,
                        "type_prediction": "",
                        "x_coord": newBB['x_coord'],
                        "y_coord": newBB['y_coord']
                    },
                    "paragraph_number": idx
                };

                let newAnnots = [];
                newAnnots.push(...elementsBefore)
                newAnnots.push(res);

                //When merging two elements around other elements, push the other elements after
                if (elementsInBetween.length > 0)
                    newAnnots.push(...elementsInBetween);
                newAnnots.push(...elementsAfter);
                
                this.setState({annotations:newAnnots,numBlocks:numBlocks,history:hist});
            }
        };

    incrementSelected = (event) => {
        event.preventDefault();
        const selectedIdx = this.state.selectedIdx;
        const targetIdx = this.getNextIdx(selectedIdx);
        this.setState({selectedIdx: targetIdx});

    };

    //Helper function for getting the previous valid index in the annotations (valid == not labeled junk)
    getPreviousIdx = (selectedIdx) => {
        const numBlocks = this.state.numBlocks;
        const annotations = this.state.annotations;

        let targetIdx =null;
        if(selectedIdx === 0){
            targetIdx = this.state.numBlocks - 1;
        }
        else{
            targetIdx = selectedIdx-1;
        }
        while(annotations[targetIdx]['paragraph']['labels'][0] === "JUNK"){
            if(targetIdx===0){
                targetIdx = selectedIdx;
                break;
            }
            else{
                targetIdx = targetIdx - 1;
            }
        }
        return targetIdx;

    }

    getNextIdx = (selectedIdx) => {
        const numBlocks = this.state.numBlocks;
        const annotations = this.state.annotations;

        let targetIdx =null;
        if(selectedIdx === numBlocks-1){
            targetIdx = 0;
        }
        else{
            targetIdx = selectedIdx+1;
        }
        while(annotations[targetIdx]['paragraph']['labels'][0] === "JUNK"){
            if(targetIdx===numBlocks-1){
                targetIdx = selectedIdx;
                break;
            }
            else{
                targetIdx = targetIdx + 1;
            }
        }
        return targetIdx;
    }
 



    decrementSelected = (event) => {
        event.preventDefault();
        
        const selectedIdx = this.state.selectedIdx;
        const targetIdx = this.getPreviousIdx(selectedIdx);

        this.setState({selectedIdx: targetIdx});
    };


    toggleHeader = (event) => {
        event.preventDefault();
        const selectedIdx = this.state.selectedIdx;
        const hdrLevel = this.props.hdrLevel;
        let annots = this.state.annotations
        
         
        //Using falsey property of empty list
        if(annots[selectedIdx]['paragraph']['labels'].length === 0){
            annots[selectedIdx]['paragraph']['labels'] = [`H${hdrLevel}`];
            this.setState({annotations:annots},()=>(
                console.log(`new state is ${JSON.stringify(this.state.annotations[selectedIdx])}`)
            ));
        }
        else{
            const currentLvl = annots[selectedIdx]['paragraph']['labels'][0];
            if(currentLvl !== `H${hdrLevel}`){
                annots[selectedIdx]['paragraph']['labels'] = [`H${hdrLevel}`];
            }
            else{
                annots[selectedIdx]['paragraph']['labels'] = [];
            }
            this.setState({annotations:annots},()=>(
                console.log(`new state is ${JSON.stringify(this.state.annotations[selectedIdx])}`)
            ));
            
        
        }
        
    };

    toggleParagraph = (event) => {
        event.preventDefault();
        const selectedIdx = this.state.selectedIdx;
        let annots = this.state.annotations
        
         
        //Using falsey property of empty list
        if(annots[selectedIdx]['paragraph']['labels'].length === 0){
            annots[selectedIdx]['paragraph']['labels'] = ["P"];
            this.setState({annotations:annots},()=>(
                console.log(`new state is ${JSON.stringify(this.state.annotations[selectedIdx])}`)
            ));
        }
        else{
            const currentLvl = annots[selectedIdx]['paragraph']['labels'][0];
            if(currentLvl !== `P`){
                annots[selectedIdx]['paragraph']['labels'] = [`P`];
            }
            else{
                annots[selectedIdx]['paragraph']['labels'] = [];
            }
            this.setState({annotations:annots},()=>(
                console.log(`new state is ${JSON.stringify(this.state.annotations[selectedIdx])}`)
            ));
            
        
        }
        
    };
    
    //Block will not render if labeled "JUNK"
    hideSelected = (event) => {
        event.preventDefault();
        
        const selectedIdx = this.state.selectedIdx;
        const hdrLevel = this.props.hdrLevel;
        let annots = this.state.annotations
        
        let hist = this.state.history;
        hist.push({"type":"hide","idx":selectedIdx});
        
        annots[selectedIdx]['paragraph']['labels'] = ['JUNK'] 
        const targetIdx = this.getNextIdx(selectedIdx)
        this.setState({annotations:annots,history:hist,selectedIdx:targetIdx},()=>(
            console.log(`new state is ${JSON.stringify(this.state.annotations[selectedIdx])}`)
        ));
       
        
    }

    undo = (event) => {
        event.preventDefault();
        let hist = this.state.history; 

        if(hist){

            const h = hist.pop();
            if (h){
                if(h['type'] == 'hide'){
                    let annots = this.state.annotations;
                    const idx = h['idx'];
                    annots[idx]['paragraph']['labels']=[]
                    this.setState({annotations:annots})
                }
                else{
                    this.setState({annotations:h});
                }
            }
        }
    }

    render(){


        // Maps json to boxes
        let annotList = this.state.annotations
                        ?   this.state.annotations.map((annotation,index) => (
                                (annotation['paragraph']['labels'][0] !== "JUNK") 
                                ?
                                    <Annotation 
                                        key={index}
                                        annotation={annotation['paragraph']['labels']}
                                        text={annotation['paragraph']['text']}
                                        selected={this.state.selectedIdx == index}
                                        onMouseUp={this.splitSelect(index)}
                                        dividerOnClick={this.mergeWrapper(index)}
                                    />
                                : null
                                
                            ))
                        : "Loading..."
            
        return(
            //Lift KeyHandlers soon so they're edited seperately
            <>
                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Select previous section']}
                    onKeyHandle={this.decrementSelected}
                />
                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Select next section']}
                    onKeyHandle={this.incrementSelected}
                />

                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Toggle header']}
                    onKeyHandle={this.toggleHeader}
                />

                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Toggle paragraph']}
                    onKeyHandle={this.toggleParagraph}
                />

                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Split selected text']}
                    onKeyHandle={this.splitCallback}
                />
                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Hide section']}
                    onKeyHandle={this.hideSelected}
                />

                <KeyHandler
                    keyEventName = {KEYPRESS}
                    keyValue={this.props.Keys['Undo change']}
                    onKeyHandle={this.undo}
                />
                


                <Container>
                    { 
                        annotList
                        
                    }
                    
                </Container>
            </>
        );
    }
/**/

}

export default AnnotationHandler;
