import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";

import { blockCategory } from "./scripts/blockConfiguration.js";
import { getBlockProperties } from "./scripts/blockProperties.js";
import {
  createCategoryButtons,
  newBlock,
  clearDropHighlights,
  toggleView,
  refreshCategoryButtons,
  updateLineNumbers,
} from "./scripts/blockCreation.js";
import { userVariables } from "./scripts/blockCreation.js";

// Import Firebase modules
import { openLoginDialog, showNotification, updateUIAfterLogin } from "./scripts/authDialogs.js";
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from "./scripts/firebaseConfig.js";

// Wait for Firebase authentication state
onAuthStateChanged(auth, (user) => {
  updateUIAfterLogin(user);
});


let dragged = null;
let highlightedBlock = null;
var pythontext = document.getElementById("pythontext");
const clickEvent = new Event('click');


// Call the function to create the buttons
document.addEventListener("DOMContentLoaded", function () {
  createCategoryButtons(blockCategory);
});

// ==========================
// 9. Python Code Conversion
// ==========================

export function blockToText(pc) {
  //pythontext.value = ""; // Clear the text area

  let parentContainer = document.getElementById(pc);
  let blockChildElements = parentContainer.querySelectorAll("*");

  let textBuilder = "";

  // set all depth to 0
  for (let i = 0; i < blockChildElements.length; i++) {
    blockChildElements[i].dataset.blockDepth = 0;
  }

  // iterate through every element and recalculate depth
  for (let i = 0; i < blockChildElements.length; i++) {
    let curBlock = blockChildElements[i];

    if (curBlock.parentElement.dataset.blockID == "if" || curBlock.parentElement.dataset.blockID == "for" || curBlock.parentElement.dataset.blockID == "when") {
      curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);

    }
    else if (curBlock.parentElement.className == "child-box-container" || curBlock.parentElement.className == "block-code-result") {
      if (curBlock.dataset.blockID == "comparisonBlock" || curBlock.className == "block-dropdown" || curBlock.dataset.blockID == "mathText") {
        curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);


      }
      else {
        curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth) + 1;

      }


    }

    // //logic for adding continue and break to text block
    // else if (curBlock == "continue" || curBlock == "break") {
    //   pythontext.value += `${childID}\n`;
    // }

    // // else {
    // //   pythontext.value += `${childID}\n`;
    // // }
    else {
      curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);
    }

  } // end of depth recalculation

  let tDepth = 1;
  let pCount = 0; //counter for parenthesis
  let cCount = 0; //counter for colon
  let mCount = 0; //counter for dropdown spaces
  let tCount = 0; //counter for when to ignore dropdown spacing
  let fCount = 1; //counter for first block
  let eCount = 1;
  

  for (let i = 0; i < blockChildElements.length; i++) {
    let curBlock = blockChildElements[i];
    
    if(curBlock.dataset.blockDepth != tDepth){


      if(pCount > 0){
        textBuilder += ")";
        pCount -= 1;
      }     
      if(cCount > 0){
        textBuilder += ":";
        cCount -= 1;
      }
      tDepth = curBlock.dataset.blockDepth;
    }

    if (curBlock.dataset.blockID == "if" || curBlock.dataset.blockID == "for" || curBlock.dataset.blockID == "while") {
      // if(pCount > 0){
      //   textBuilder += ")\n";
      //   pCount -= 1;
      // }
      // if(cCount > 0){
      //   textBuilder += ":\n";
      //   cCount -= 1;
      // }
      // eCount +
      if(fCount == 0){
        textBuilder += "\n";
        
      }
      else if(fCount == 1){
        fCount -= 1;
      }
      if(mCount > 0){
        mCount -= 1;
      }
      cCount += 1;

      for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
        textBuilder += "  ";
      }
      textBuilder += `${curBlock.dataset.blockID}`;
      
      tDepth = curBlock.dataset.blockDepth;
    }
    else if (curBlock.dataset.elifElseType == "elif" || curBlock.dataset.elifElseType == "else") {
      // if(pCount > 0){
      //   textBuilder += ")";
      //   pCount -= 1;
      // }
      if(cCount > 0){
        textBuilder += ":";
        cCount -= 1;
      }
      //textBuilder += "\n";


      for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
        textBuilder += "  ";
      }
      if (curBlock.dataset.elifElseType == "elif") {
        console.log("i = " + `${i}`);
        textBuilder += "\n" + "else if";
        cCount += 1;
        tDepth = curBlock.dataset.blockDepth;
      }
      else if (curBlock.dataset.elifElseType == "else") {
        textBuilder += "\n" + "else:";
      }
    }

    if(curBlock.dataset.blockID == "varOps"){
      if(fCount == 0){
        textBuilder += "\n"
      }
      else if(fCount == 1){
        fCount -= 1;
      }
      for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
        textBuilder += "  ";
      }
      mCount += 1;
    }
    

    if(curBlock.dataset.blockID == "comparisonBlock"){
      // if(fCount == 0){
      //   textBuilder += "\n"
      // }
      // else if(fCount == 1){
      //   fCount -= 1;
      // }
      
      // mCount += 1;
    }


    if (curBlock.className == "block-dropdown") {
      // if (curBlock.dataset.blockDepth > tDepth) {
      //   //textBuilder += ":\n";
      //   for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
      //     textBuilder += "  ";
      //   }
      //   textBuilder += `${curBlock.value}`
      //   tDepth = curBlock.dataset.blockDepth;
      // }
      // else {
      //   textBuilder += " " + `${curBlock.value}`;
      // }

      if(mCount > 0){
        textBuilder +=  `${curBlock.value}`;
        mCount -= 1;
      }
      else{
        textBuilder += " " + `${curBlock.value}`;
      }
    }

    if (curBlock.dataset.blockID == "print") {
      if(pCount > 0){
        textBuilder += ")" + "\n";
        pCount -= 1;
      }
      if(cCount > 0){
        textBuilder += ":";
      }
      textBuilder += "\n";
      for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
        textBuilder += "  ";
      }
      textBuilder += "print(";
      pCount += 1;
    }

    if(curBlock.dataset.blockID == "printText"){
      textBuilder += curBlock.innerText;
    }
    if (curBlock.className == "text-input") {
      // if (curBlock.dataset.blockDepth > tDepth) {
      //   textBuilder += "\n";
      //   tDepth = curBlock.dataset.blockDepth;
      // }
      // else 
      if(curBlock.dataset.blockDepth = tDepth){
        textBuilder += " ";
      }
      if(mCount > 0){
        mCount -= 1;
      }
      textBuilder += "\"" + `${curBlock.value}` + "\"";
    }
    if (curBlock.className == "math-input") {
      // if (curBlock.dataset.blockDepth > tDepth) {
      //   textBuilder += "\n";
      //   tDepth = curBlock.dataset.blockDepth;
      // }
      // else 
      if(curBlock.dataset.blockDepth = tDepth){
        if(tCount == 0){
          textBuilder += " ";
        }
        
      }
      if(tCount > 0){
        textBuilder += '(' + `${curBlock.value}` + ')' ;
        tCount -= 1;
      }
      else{
        textBuilder += `${curBlock.value}`;
      }
      if(mCount > 0){
        mCount -= 1;
      }
      
      
    }
    if (curBlock.dataset.blockID == "mathConstants") {
      textBuilder += " math.";
      mCount += 1;
    }
    if (curBlock.dataset.blockID == "movement") {
      textBuilder += "\n";
      textBuilder += "turtle.";
      tCount += 1;
      mCount += 2;
    }
    if (curBlock.dataset.blockID == "home") {
      textBuilder += "\n";
      textBuilder += "turtle.home()";      
    }
    if (curBlock.dataset.blockID == "speed") {
      textBuilder += "\n";
      textBuilder += "turtle.speed";
      tCount += 1;
    }
    if (curBlock.dataset.blockID == "penup" || curBlock.dataset.blockID == "pendown") {
      textBuilder += "\n";
      textBuilder += 'turtle.' + `${curBlock.dataset.blockID}` + '()';
    }
    


    if(i == blockChildElements.length - 1){
      console.log("CLOSING TIME");
      // if(pCount > 0){
      //   textBuilder += ")\n";
      //   pCount -= 1;
      // }
      // if(cCount > 0){
      //   textBuilder += ":\n";
      //   cCount -= 1;
      // }
    }
  }
  


  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: textBuilder
    }
  })

} // END OF BTT()

// Function to convert text programming to block programming
export function textToBlock(container) {
  // let text = pythontext.value;
  let text = editor.state.doc.text.toString();
  // if (container == "box-container") {
  //   document.getElementById(container).innerHTML = ""; // Clear block container
  // }
  document.getElementById(container).innerHTML = ""
  console.log("text = " + `${editor.state.doc.text.toString()}`);

  let lines = text.split(","); // Separate lines for parsing

  let depthBuilder = ["box-container"]; // counting preceeding zeros for depth

  let elseChild;

  for (let i = 0; i < lines.length; i++) {
    let currDepth = 0;
    let linecount = 0;
    for (let j = 0; j < lines[i].length; j++) {

      if (lines[i][j] == " ") {
        linecount++;
      }
      else {
        break;
      }
    }


    // setting currDepth based on number of indentations
    if (linecount < 1) {
      // console.log("lineCount = " + `${linecount}`);
      // console.log("currDepth = " + `${currDepth}`);

      currDepth = 1;


    }
    else {
      // console.log("lineCount = " + `${linecount}`);
      // console.log("currDepth = " + `${currDepth}`);
      currDepth = (linecount / 2) + 1;
    }

    lines[i] = lines[i].trim(); // trimming text line for whitespace

    // Line deleting colon for statements
    if (lines[i][lines[i].length - 1] == ':') {
      lines[i] = lines[i].substring(0, lines[i].length - 1);
    }

    let tokens = lines[i].split(" "); // splitting string into tokens

    // logic to build blocks
    if (tokens != "") {

      if (tokens[0] == "if" || tokens[0] == "while" || tokens[0] == "for" || tokens[1] == "if" ){


        console.log(`${tokens[0]}` + " statement");
        let nbCons;
        let nbRef;

        // Logic for else if blocks
        if (tokens[1] == "if") {
          console.log('depthBuilder: ' + `${depthBuilder}`);
          let tempIf = document.getElementById(depthBuilder[currDepth]);
          let tempClick = tempIf.querySelectorAll(".fa-solid");
          tempClick[tempClick.length - 1].dispatchEvent(clickEvent);
          let elDrops = tempIf.querySelectorAll(".dropdown-item");
          elDrops[0].dispatchEvent(clickEvent);

          let elseRef = document.getElementById(depthBuilder[currDepth]).querySelectorAll(".child-box-container"); // if block reference
          for (let k = 0; k < elseRef.length; k++) {
            if (elseRef[k].getAttribute("data-if-elif-else-id") == "1") {
              elseChild = elseRef[k]; // assigns elseChild with
            }
          }
          let horRef = document.getElementById(depthBuilder[currDepth]).querySelectorAll(".child-box-container-horizontal");
          console.log(horRef[horRef.length - 1]);
          nbRef = horRef[horRef.length - 1];
          blockBuilder(tokens, nbRef);
        }
        else {
          nbCons = newBlock(tokens[0]); // newblock construction based on keyword
          nbRef = document.getElementById(nbCons); // created reference to newblock
          depthBuilder[currDepth] = nbRef.id; // put block reference into depth array
          nbRef.dataset.blockDepth = currDepth; // update depth of block
          console.log(depthBuilder);


          if (depthBuilder[currDepth - 1] != "box-container") {
            if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-if-elif-else-id") == "1") {
              console.log("PARENT IS AN ELSE")
              let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
              parentBlock[parentBlock.length - 1].append(document.getElementById(nbCons));
            }
            else {
              let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
              parentBlock.append(document.getElementById(nbCons));

            }
          }
          blockBuilder(tokens, nbRef.querySelector(".child-box-container-horizontal"))
        }
        let j = 1

      }

      else if (tokens[0] == "else" && tokens.length == 1) {
        let tempIf = document.getElementById(depthBuilder[currDepth]);
        let tempClick = tempIf.querySelectorAll(".fa-solid");
        tempClick[tempClick.length - 1].dispatchEvent(clickEvent);
        let elDrops = tempIf.querySelectorAll(".dropdown-item");
        console.log(elDrops);
        elDrops[1].dispatchEvent(clickEvent);

      }



      // building CONTINUE and BREAK
      // else if (tokens[0] == "continue" || tokens[0] == "break") {
      //   console.log(tokens[0]);
      //   let nbCons = newBlock(tokens[0]); // newblock construction based on keyword
      //   let nbRef = document.getElementById(nbCons); // created reference to newblock
      //   nbRef.dataset.blockDepth = currDepth;
      //   depthBuilder[currDepth] = nbRef;
      //   console.log(depthBuilder);

      //   if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-if-elif-else-id") > "0") {
      //     console.log("PARENT IS AN ELSE")
      //     let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
      //     parentBlock[parentBlock.length - 1].append(document.getElementById(nbCons));
      //   }
      //   else {
      //     let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
      //     parentBlock.append(document.getElementById(nbCons));
      //   }
      // }
      else if(tokens[0][0] == 'p' && tokens[0][1] == 'r' && tokens[0][2] == 'i' && tokens[0][3] == 'n' && tokens[0][4] == 't'){
        console.log("PRINT IN TTB");
        let nbCons = newBlock("print"); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock
        depthBuilder[currDepth] = nbRef.id;
        nbRef.dataset.blockDepth = currDepth;
        depthBuilder[currDepth] = nbRef;

        if (depthBuilder[currDepth - 1] != "box-container") {
          if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-if-elif-else-id") >= "1") {
            console.log("PARENT IS AN ELSE")
            let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
            parentBlock[parentBlock.length - 1].append(document.getElementById(nbCons));
          }
          else {
            let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
            console.log(document.getElementById(nbCons))
            parentBlock.append(document.getElementById(nbCons));

          }
        }

        blockBuilder(tokens, nbRef.querySelector(".child-box-container-horizontal"))
      }

      else if(tokens[2] == "in"){
        if (depthBuilder[currDepth - 1] != "box-container") {
          if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-else-if-count") > "0") {
            console.log("PARENT IS AN ELSE")
            let nbRef = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
            parentBlock = nbRef[nbRef.length - 1];
          }
          else {
          parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
          }
        }
        else{
          parentBlock = document.getElementById("box-container");
        }



        blockBuilder(tokens, parentBlock);
        console.log("END OF ALL ELSE");

      }

      else {
        console.log('current string is: ' + `${tokens}`);
        let parentBlock;
        if (depthBuilder[currDepth - 1] != "box-container") {
        if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-else-if-count") > "0") {
          console.log("PARENT IS AN ELSE")
          let nbRef = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
          parentBlock = nbRef[nbRef.length - 1];
        }
        else {
          parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
        }
      }
      else{
        parentBlock = document.getElementById("box-container");
      }



        blockBuilder(tokens, parentBlock);
        console.log("END OF ALL ELSE");
      }

    }

    // console.log('depthBuilder: ' + `${depthBuilder}`);
    updateLineNumbers();
    refreshCategoryButtons();
  }

} // END OF TTB()

function blockBuilder(arr, container) {

  //sets for comparison block, math block, and variable ops block checking
  let compValues = ["==", "!=", ">", "<", "<=", ">="];
  let mathValues = ["+", "-", "*", "/", "%", "**", "//"];
  let varValues = ["=", "+=", "-=", "*=", "/="];

  let mathConstants = ["e", "pi", "tau", "inf", "nan"];

  let varArray = [];
  let rightMostBlock; //for storing the rightmost block.
  let returnArray = [];

  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);

    //loop to identify variables
    for(let j = 0; j < arr.length; j++){
      if(arr[i] == "="){
        if (!userVariables.includes(arr[i - 1])) {
          userVariables.push(arr[i - 1]);
        }
      }
    }


    //comparison logic
    if(compValues.includes(arr[i])){

      //check for rightmost block
      //if no rightmost block -> store this block
      //if rightmost block exists -> must be or/and




      console.log("COMPARISON FOUND")
      
      // create new block
      let nbCons = newBlock("comparisonBlock"); //new comparison block
      let compRef = document.getElementById(nbCons); //reference to comparison block
      let compContainers = compRef.querySelectorAll(".child-box-container-horizontal");

      //check for multiple comparisons
      if(arr.length <= 4){                
        console.log("CONTAINERS CONTAINED");

        //select dropdown from comparison block
        console.log(compRef.querySelector(" .block-dropdown"));
        compRef.querySelector(" .block-dropdown").value = arr[i];

        if(userVariables.includes(arr[i-1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        else if(arr[i-1][0] >= "0" && arr[i-1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i - 1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        //end left side assignment


        //append right side

        if(userVariables.includes(arr[i+1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);
        }
        else if(arr[i+1][0] >= "0" && arr[i+1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);


        }

        //push block to return array
        returnArray.push(compRef);
      }
      else{
        let clickRef = compRef.querySelector(" .fa-plus");

        //select leftmost dropdown
        console.log(compRef.querySelector(" .block-dropdown"));
        compRef.querySelector(" .block-dropdown").value = arr[i];

        //placeholder for current container
        let currContainer;

        //assign left variable
        if(userVariables.includes(arr[i-1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        else if(arr[i-1][0] >= "0" && arr[i-1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i - 1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }





        //loop through array for to expand right side and create current rightmost block
        for(let j = i+1; j < arr.length; j++){
           if(compValues.includes(arr[j])){
            i = j;
            
            compContainers = compRef.querySelectorAll(".child-box-container-horizontal"); //refreshes containers

            //find rightmost container
            currContainer = compContainers[compContainers.length -1];
            console.log(currContainer);



            //create variable
            if(userVariables.includes(arr[j-1])){
              //new block for variable
              //refrence for variable block
              let newVar = newBlock("variableBlock");
              let newRef = document.getElementById(newVar);
    
              //assign value to variable block
              newRef.querySelector(".block-dropdown").value = arr[j-1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            else if(arr[j-1][0] >= "0" && arr[j-1][0] <= "9"){
    
              //new block for variable
              //refrence for variable block
              let newMathtext = newBlock("mathText");
              let newRef = document.getElementById(newMathtext);
    
    
              
              //assign value to variable block
              let mathInput = newRef.querySelector(".math-input")
              mathInput.value = arr[j - 1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
    
            }
            else{
              //new block for variable
              //refrence for variable block
              let newText = newBlock("printText");
              let newRef = document.getElementById(newText);
    
              //assign value to variable block
              newRef.querySelector(".text-input").value += arr[j-1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            //end of middle block assignments


            clickRef.dispatchEvent(clickEvent); //clicks to add another container

            //update dropdown list
            let dropList = compRef.querySelectorAll(" .block-dropdown");
            dropList[dropList.length-1].value = arr[j];
            console.log("DROPDOWN POINTER");
            console.log(dropList.length);
           }

          //assign last block to rightmost container
          if(j == arr.length -1){
            compContainers = compRef.querySelectorAll(".child-box-container-horizontal"); //refreshes containers
            currContainer = compContainers[compContainers.length -1];

            console.log("THIS IS THE LAST ONE");
            if(userVariables.includes(arr[j])){
              //new block for variable
              //refrence for variable block
              let newVar = newBlock("variableBlock");
              let newRef = document.getElementById(newVar);
    
              //assign value to variable block
              newRef.querySelector(".block-dropdown").value = arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            else if(arr[j][0] >= "0" && arr[j][0] <= "9"){
    
              //new block for variable
              //refrence for variable block
              let newMathtext = newBlock("mathText");
              let newRef = document.getElementById(newMathtext);
    
    
              
              //assign value to variable block
              let mathInput = newRef.querySelector(".math-input")
              mathInput.value = arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
    
            }
            else{
              //new block for variable
              //refrence for variable block
              let newText = newBlock("printText");
              let newRef = document.getElementById(newText);
    
              //assign value to variable block
              newRef.querySelector(".text-input").value += arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
          }


           console.log(arr[j]);
        }
        returnArray.push(compRef);
      }

    }

    

    //math block logic
    else if(mathValues.includes(arr[i])){

      //check for rightmost block
      //if no rightmost block -> store this block
      //if rightmost block exists -> must be or/and




      console.log("COMPARISON FOUND")
      
      // create new block
      let nbCons = newBlock("mathBlock"); //new comparison block
      let compRef = document.getElementById(nbCons); //reference to comparison block
      let compContainers = compRef.querySelectorAll(".child-box-container-horizontal");

      //check for multiple comparisons
      if(arr.length <= 3){                
        console.log("CONTAINERS CONTAINED");

        //select dropdown from comparison block
        console.log(compRef.querySelector(" .block-dropdown"));
        compRef.querySelector(" .block-dropdown").value = arr[i];

        if(userVariables.includes(arr[i-1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        else if(arr[i-1][0] >= "0" && arr[i-1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i - 1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        //end left side assignment


        //append right side

        if(userVariables.includes(arr[i+1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);
        }
        else if(arr[i+1][0] >= "0" && arr[i+1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);


        }

        //push block to return array
        returnArray.push(compRef);
      }
      else{
        let clickRef = compRef.querySelector(" .fa-plus");

        //select leftmost dropdown
        console.log(compRef.querySelector(" .block-dropdown"));
        compRef.querySelector(" .block-dropdown").value = arr[i];

        //placeholder for current container
        let currContainer;

        //assign left variable
        if(userVariables.includes(arr[i-1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        else if(arr[i-1][0] >= "0" && arr[i-1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i - 1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }





        //loop through array for to expand right side and create current rightmost block
        for(let j = i+1; j < arr.length; j++){
           if(mathValues.includes(arr[j])){
            i = j;
            
            compContainers = compRef.querySelectorAll(".child-box-container-horizontal"); //refreshes containers

            //find rightmost container
            currContainer = compContainers[compContainers.length -1];
            console.log(currContainer);



            //create variable
            if(userVariables.includes(arr[j-1])){
              //new block for variable
              //refrence for variable block
              let newVar = newBlock("variableBlock");
              let newRef = document.getElementById(newVar);
    
              //assign value to variable block
              newRef.querySelector(".block-dropdown").value = arr[j-1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            else if(arr[j-1][0] >= "0" && arr[j-1][0] <= "9"){
    
              //new block for variable
              //refrence for variable block
              let newMathtext = newBlock("mathText");
              let newRef = document.getElementById(newMathtext);
    
    
              
              //assign value to variable block
              let mathInput = newRef.querySelector(".math-input")
              mathInput.value = arr[j - 1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
    
            }
            else{
              //new block for variable
              //refrence for variable block
              let newText = newBlock("printText");
              let newRef = document.getElementById(newText);
    
              //assign value to variable block
              newRef.querySelector(".text-input").value += arr[j-1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            //end of middle block assignments


            clickRef.dispatchEvent(clickEvent); //clicks to add another container

            //update dropdown list
            let dropList = compRef.querySelectorAll(" .block-dropdown");
            dropList[dropList.length-1].value = arr[j];
            console.log("DROPDOWN POINTER");
            console.log(dropList.length);
           }

          //assign last block to rightmost container
          if(j == arr.length -1){
            compContainers = compRef.querySelectorAll(".child-box-container-horizontal"); //refreshes containers
            currContainer = compContainers[compContainers.length -1];

            console.log("THIS IS THE LAST ONE");
            if(userVariables.includes(arr[j])){
              //new block for variable
              //refrence for variable block
              let newVar = newBlock("variableBlock");
              let newRef = document.getElementById(newVar);
    
              //assign value to variable block
              newRef.querySelector(".block-dropdown").value = arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            else if(arr[j][0] >= "0" && arr[j][0] <= "9"){
    
              //new block for variable
              //refrence for variable block
              let newMathtext = newBlock("mathText");
              let newRef = document.getElementById(newMathtext);
    
    
              
              //assign value to variable block
              let mathInput = newRef.querySelector(".math-input")
              mathInput.value = arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
    
            }
            else{
              //new block for variable
              //refrence for variable block
              let newText = newBlock("printText");
              let newRef = document.getElementById(newText);
    
              //assign value to variable block
              newRef.querySelector(".text-input").value += arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
          }


           console.log(arr[j]);
        }
        returnArray.push(compRef);
      }

    }

    //variable operations logic
    else if(varValues.includes(arr[i])){

      //check for rightmost block
      //if no rightmost block -> store this block
      //if rightmost block exists -> must be or/and




      console.log("COMPARISON FOUND")
      
      // create new block
      let nbCons = newBlock("varOps"); //new comparison block
      let compRef = document.getElementById(nbCons); //reference to comparison block
      let compContainers = compRef.querySelectorAll(".child-box-container-horizontal");

      //check for multiple comparisons
      if(arr.length <= 3){                
        console.log("CONTAINERS CONTAINED");

        //select dropdown from comparison block
        console.log(compRef.querySelector(" .block-dropdown"));
        compRef.querySelector(" .block-dropdown").value = arr[i];

        if(userVariables.includes(arr[i-1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        else if(arr[i-1][0] >= "0" && arr[i-1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i - 1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        //end left side assignment


        //append right side

        if(userVariables.includes(arr[i+1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);
        }
        else if(arr[i+1][0] >= "0" && arr[i+1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i+1];

          //append variable block to comparison block left side
          compContainers[1].appendChild(newRef);


        }

        //push block to return array
        returnArray.push(compRef);
      }
      else{
        let clickRef = compRef.querySelector(" .fa-plus");

        //select leftmost dropdown
        console.log(compRef.querySelector(" .block-dropdown"));
        compRef.querySelector(" .block-dropdown").value = arr[i];

        //placeholder for current container
        let currContainer;

        //assign left variable
        if(userVariables.includes(arr[i-1])){
          //new block for variable
          //refrence for variable block
          let newVar = newBlock("variableBlock");
          let newRef = document.getElementById(newVar);

          //assign value to variable block
          newRef.querySelector(".block-dropdown").value = arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }
        else if(arr[i-1][0] >= "0" && arr[i-1][0] <= "9"){

          //new block for variable
          //refrence for variable block
          let newMathtext = newBlock("mathText");
          let newRef = document.getElementById(newMathtext);


          
          //assign value to variable block
          let mathInput = newRef.querySelector(".math-input")
          mathInput.value = arr[i - 1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);

        }
        else{
          //new block for variable
          //refrence for variable block
          let newText = newBlock("printText");
          let newRef = document.getElementById(newText);

          

          //assign value to variable block
          newRef.querySelector(".text-input").value += arr[i-1];

          //append variable block to comparison block left side
          compContainers[0].appendChild(newRef);
        }





        //loop through array for to expand right side and create current rightmost block
        for(let j = i+1; j < arr.length; j++){
           if(varValues.includes(arr[j])){
            i = j;
            
            compContainers = compRef.querySelectorAll(".child-box-container-horizontal"); //refreshes containers

            //find rightmost container
            currContainer = compContainers[compContainers.length -1];
            console.log(currContainer);



            //create variable
            if(userVariables.includes(arr[j-1])){
              //new block for variable
              //refrence for variable block
              let newVar = newBlock("variableBlock");
              let newRef = document.getElementById(newVar);
    
              //assign value to variable block
              newRef.querySelector(".block-dropdown").value = arr[j-1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            else if(arr[j-1][0] >= "0" && arr[j-1][0] <= "9"){
    
              //new block for variable
              //refrence for variable block
              let newMathtext = newBlock("mathText");
              let newRef = document.getElementById(newMathtext);
    
    
              
              //assign value to variable block
              let mathInput = newRef.querySelector(".math-input")
              mathInput.value = arr[j - 1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
    
            }
            else{
              //new block for variable
              //refrence for variable block
              let newText = newBlock("printText");
              let newRef = document.getElementById(newText);
    
              //assign value to variable block
              newRef.querySelector(".text-input").value += arr[j-1];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            //end of middle block assignments


            clickRef.dispatchEvent(clickEvent); //clicks to add another container

            //update dropdown list
            let dropList = compRef.querySelectorAll(" .block-dropdown");
            dropList[dropList.length-1].value = arr[j];
            console.log("DROPDOWN POINTER");
            console.log(dropList.length);
           }

          //assign last block to rightmost container
          if(j == arr.length -1){
            compContainers = compRef.querySelectorAll(".child-box-container-horizontal"); //refreshes containers
            currContainer = compContainers[compContainers.length -1];

            console.log("THIS IS THE LAST ONE");
            if(userVariables.includes(arr[j])){
              //new block for variable
              //refrence for variable block
              let newVar = newBlock("variableBlock");
              let newRef = document.getElementById(newVar);
    
              //assign value to variable block
              newRef.querySelector(".block-dropdown").value = arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
            else if(arr[j][0] >= "0" && arr[j][0] <= "9"){
    
              //new block for variable
              //refrence for variable block
              let newMathtext = newBlock("mathText");
              let newRef = document.getElementById(newMathtext);
    
    
              
              //assign value to variable block
              let mathInput = newRef.querySelector(".math-input")
              mathInput.value = arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
    
            }
            else{
              //new block for variable
              //refrence for variable block
              let newText = newBlock("printText");
              let newRef = document.getElementById(newText);
    
              //assign value to variable block
              newRef.querySelector(".text-input").value += arr[j];
    
              //append variable block to comparison block left side
              currContainer.appendChild(newRef);
            }
          }


           console.log(arr[j]);
        }
        returnArray.push(compRef);
      }

    }
    //range logic
    else if(arr[0] == "for" && arr[2] == "in"){
      //logic for range function

      //create range block
      let rangeCons = newBlock("range");
      let rangeRef = document.getElementById(rangeCons);
      let rangeBox = rangeRef.querySelectorAll(".child-box-container-horizontal");


      //append left value
      let tempText = newBlock("printText");
      let ttRef = document.getElementById(tempText);
      ttRef.innerText += arr[1];
      rangeBox[0].append(ttRef);

      //append right value
      let tempRange = newBlock("printText");
      let trRef = document.getElementById(tempRange);
      let textRange = "";
      for(let j = 3; j < arr.length; j++){
        textRange += arr[j];
      }
      textRange = textRange.substring(6, textRange.length-1);
      trRef.innerText += textRange;

      
      rangeBox[1].append(trRef);
      
      //not implemented at this time
      returnArray.push(rangeRef);

      i = arr.length;

    }
    
    //print logic
    else if(arr[0][0] == "p" && arr[0][1] == "r"){
      
      //append left value
      let tempText = newBlock("printText");
      let ttRef = document.getElementById(tempText);
      let fullLen = 0;
      

      let textRange = "";
      for(let j = 0; j < arr.length; j++){
        textRange += arr[j] + " ";
      }
      textRange = textRange.substring(6, textRange.length-2);
      ttRef.innerText += textRange;

      
      //not implemented at this time
      returnArray.push(ttRef);

      i = arr.length;

    }

    //math functions logic
    else if(arr[0][0] == "m" && arr[0][1] == "a" && arr[0][2] == "t" && arr[0][3] == "h"){

      // let matha = ["(round)", "(ceil)", "(floor)", "(truc)", "(abs)"];
      // let mathb = ["(gcd)", "(lcm)", "(factorial)", "(sum)", "(prod)"];
      // let mathc = ["(log)", "(log10)", "(exp)", "(sqrt)", "(pow)"];
      // let mathd = ["(sin)", "(cos)", "(tan)", "(asin)", "(acos)", "(atan)", "(radians)", "(degrees)"];

      console.log("MATH DETECTED");
      let mathBuilder = arr[0].substring(5, arr[0].length);
      console.log("MATH SUBSTRING: ");
      console.log(mathBuilder);
      let threeChar = mathBuilder.substring(0,3);
      console.log(threeChar);
      let dropItem;
      let remainder;
      let mathType;
      let nbCons;
      let compRef;

      //mathType = "roundAbs";
      //mathType = "basicArithmatic";
      //mathType = "logExp";
      //mathType = "trigFunctions";
      if(mathBuilder[0] == 'p' && mathBuilder[1] == 'i'){
        console.log("CONSTANT");
        nbCons = newBlock("mathConstants"); //new comparison block
        compRef = document.getElementById(nbCons); //reference to comparison block
        let mathDrop = compRef.querySelector(" .block-dropdown");
        mathDrop.value = "pi";
      }
      else if(mathBuilder[0] == 'e'){
        console.log("CONSTANT");
        nbCons = newBlock("mathConstants"); //new comparison block
        compRef = document.getElementById(nbCons); //reference to comparison block
        let mathDrop = compRef.querySelector(" .block-dropdown");
        mathDrop.value = "e";

      }
      else if(mathBuilder[0] == 't' && mathBuilder[1] == 'a' && mathBuilder[2] == 'u'){
        console.log("CONSTANT");
        nbCons = newBlock("mathConstants"); //new comparison block
        compRef = document.getElementById(nbCons); //reference to comparison block
        let mathDrop = compRef.querySelector(" .block-dropdown");
        mathDrop.value = "tau";

      }
      else if(mathBuilder[0] == 'i' && mathBuilder[1] == 'n' && mathBuilder[2] == 'f'){
        console.log("CONSTANT");
        nbCons = newBlock("mathConstants"); //new comparison block
        compRef = document.getElementById(nbCons); //reference to comparison block
        let mathDrop = compRef.querySelector(" .block-dropdown");
        mathDrop.value = "inf";

      }
      else if(mathBuilder[0] == 'n' && mathBuilder[1] == 'a' && mathBuilder[2] == 'n'){
        console.log("CONSTANT");
        nbCons = newBlock("mathConstants"); //new comparison block
        compRef = document.getElementById(nbCons); //reference to comparison block
        let mathDrop = compRef.querySelector(" .block-dropdown");
        mathDrop.value = "nan";

      }
      else{
        switch(threeChar){
          case "rou":
            dropItem = "round";
            remainder = mathBuilder.substring(6,mathBuilder.length-1);
            mathType = "roundAbs"

            // nbCons = newBlock(mathType); //new comparison block
            // compRef = document.getElementById(nbCons); //reference to comparison block
            // let mathDrop = compRef.querySelector(" .block-dropdown");
            // mathDrop.value = dropItem;
            break;

          case "cei":
            dropItem = "ceil";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "roundAbs";
            break;

          case "flo":
            dropItem = "floor";
            remainder = mathBuilder.substring(6,mathBuilder.length-1);
            mathType = "roundAbs";
            break;

          case "tru":
            dropItem = "truc";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "roundAbs";
            break;

          case "abs":
            dropItem = "abs";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "roundAbs";
            break;

          case "gcd":
            dropItem = "gcd";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "basicArithmetic";
            break;

          case "lcm":
            dropItem = "lcm";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "basicArithmetic";
            break;
          case "fac":
            dropItem = "factorial";
            remainder = mathBuilder.substring(9,mathBuilder.length-1);
            mathType = "basicArithmetic";
            break;
          case "sum":
            dropItem = "sum";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "basicArithmetic";
            break;
          case "pro":
            dropItem = "prod";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "basicArithmetic";
            break;
          case "log":
            if(mathBuilder[3] == "1"){
              dropItem = "log10";
              remainder = mathBuilder.substring(6,mathBuilder.length-1);
              mathType = "logExp";
            }
            else{
              dropItem = "log";
              remainder = mathBuilder.substring(4,mathBuilder.length-1);
              mathType = "logExp";
            }
            
            break;
          case "exp":
            dropItem = "exp";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "logExp";
            break;
          case "sqr":
            dropItem = "sqrt";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "logExp";
            break;
          case "pow":
            dropItem = "pow";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "logExp";
            break;
          case "sin":
            dropItem = "sin";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "cos":
            dropItem = "cos";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "tan":
            dropItem = "tan";
            remainder = mathBuilder.substring(4,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "asi":
            dropItem = "asin";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "aco":
            dropItem = "acos";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "ata":
            dropItem = "atan";
            remainder = mathBuilder.substring(5,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "rad": 
            dropItem = "radians";
            remainder = mathBuilder.substring(8,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
          case "deg": 
            dropItem = "degrees";
            remainder = mathBuilder.substring(8,mathBuilder.length-1);
            mathType = "trigFunctions";
            break;
        }
        //end switch statement
        nbCons = newBlock(mathType); //new comparison block
        compRef = document.getElementById(nbCons); //reference to comparison block
        let mathDrop = compRef.querySelector(".block-dropdown");
        mathDrop.value = dropItem;

        let newText = newBlock("printText");
        let newRef = document.getElementById(newText);
        newRef.innerText += remainder;

        let stash = compRef.querySelector(".child-box-container-horizontal");
        stash.append(newRef);


        returnArray.push(compRef);





        
      }
      //end else
      
      
      //let compContainers = compRef.querySelectorAll(".child-box-container-horizontal");
    }

    //turtle command logic

    
    

    //random text logic
    
  }


  // console.log("varArr:");
  // console.log(varArray);
  // console.log("rightMostBlock:");
  // console.log(rightMostBlock);
  // console.log("returnArray:");
  // console.log(returnArray);

  for (let i = 0; i < returnArray.length; i++) {
    container.appendChild(returnArray[i]);
  }

} // end blockBuilder()


// ==========================
// 10. Code Execution
// ==========================

let editor = new EditorView({
  parent: pythontext,
  extensions: [basicSetup, python()],
});

function getCode() {
  return editor.state.doc.toString();
}

function setCode(content) {
  editor.dispatch({
    changes: { from: 0, to: editor.state.doc.length, insert: content }
  });
}

//document.getElementById("run-code-btn").addEventListener("click", runCode);

// Function to run the Python code
function runCode() {
  var prog = getCode();
  var mypre = document.getElementById("output"); // Output area
  mypre.innerHTML = ""; // Clear previous output

  Sk.pre = "output";
  //console.log(Sk);
  Sk.configure({ output: outf, read: builtinRead });
  (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";

  //KEEP INDENTS AS IS FOR PYTHON CODE; DO NOT CHANGE turtleSetupCode
  var turtleSetupCode = `
import turtle
import math
import random
`;

  const setupLines = turtleSetupCode.split("\n").length;
  var cleanedProg = prog.trimStart();
  console.log("user code:", prog);
  var fullProg = turtleSetupCode + "\n" + cleanedProg;
  //console.log("Combined code:", fullProg);

  try {
    Sk.misceval
      .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, fullProg, true))
      .catch(err => {
        const formatted = formatSkulptError(err, setupLines);
        mypre.innerHTML += formatted;
      });
  } catch (err) {
    const formatted = formatSkulptError(err, setupLines);
    mypre.innerHTML += formatted;
  }
}

window.runCode = runCode;

// Function to handle output of Python code
let lineBuffer = "";
let atLineStart = true;

function outf(text) {
  const mypre = document.getElementById("output");

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (atLineStart) {
      lineBuffer += `<span style="color: green;">&gt;</span> `;
      atLineStart = false;
    }

    if (char === "<") {
      lineBuffer += "&lt;";
    } else if (char === ">") {
      lineBuffer += "&gt;";
    } else if (char === "\t") {
      lineBuffer += "&nbsp;&nbsp;&nbsp;&nbsp;";
    } else if (char === "\n") {
      lineBuffer += "<br>";
      mypre.innerHTML += lineBuffer;
      lineBuffer = "";
      atLineStart = true;
    } else {
      lineBuffer += char;
    }
  }
}


document.getElementById("pythontext").addEventListener("keydown", function (e) {
  if (e.key == "Tab") {
    e.preventDefault();
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const tabNode = document.createTextNode("  ");

    range.insertNode(tabNode);
    range.setStartAfter(tabNode);
    range.setEndAfter(tabNode);
    selection.removeAllRanges();
    selection.addRange(range);
  }
})

// Function to read built-in files
function builtinRead(x) {
  if (
    Sk.builtinFiles === undefined ||
    Sk.builtinFiles["files"][x] === undefined
  )
    throw "File not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
}

function formatSkulptError(err, offset) {
  let errorText = "";
  if (err instanceof Sk.builtin.BaseException) {
    errorText = err.toString();
  } else {
    errorText = err.toString();
  }

  errorText = errorText.replace(/on line (\d+)/g, function (match, p1) {
    const lineNum = parseInt(p1, 10) - offset;
    return `on line ${lineNum > 0 ? lineNum : 1}`;
  });

  errorText = errorText
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<span style="color: red;">${errorText}</span><br>`;
}

// ==========================
// 11. Event Listeners
// ==========================

function setupKeydownListener() {
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
      runCode();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
      saveFile();
    }
  });
}

function setUpTutorialListener() {
  function launchTutorial() {
    const intro = introJs();

    intro.oncomplete(() => {
      localStorage.setItem("tutorialCompleted", "true");
    });

    intro.start();
  }

  // Auto-run tutorial if it's the user's first time (stored in localStorage in browser>: Insepct Element>Application>Local Storage) 
  if (!localStorage.getItem("tutorialCompleted")) {
    launchTutorial();
  }

  // Run tutorial from burger menu
  document.getElementById("viewTutorialBtn").addEventListener("click", () => {
    launchTutorial();
  });
}

function setupFileNameModalEvents() {
  const input = document.getElementById("fileNameInput");
  const modal = document.getElementById("fileNameModal");

  document.getElementById("submitFileName").addEventListener("click", () => {
    const name = input.value.trim();
    if (name) {
      modal.style.display = "none";
      input.value = "";
      saveFile(name);
    } else {
      showNotification("Please enter a valid filename.", "red");
    }
  });

  document.getElementById("fileNameInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById("submitFileName").click();
    }
  });

  document.getElementById("cancelFileName").addEventListener("click", () => {
    modal.style.display = "none";
    input.value = "";
  });

  document.getElementById("closeFileNameModal").addEventListener("click", () => {
    modal.style.display = "none";
    input.value = "";
  });
}

function setupClearHighlightsOnClickListener() {
  // event listener for clearing highlights when clicking 
  // (fixes glitch with highlights not clearing properly after dragging and dropping)
  document.addEventListener("click", function () {
    clearDropHighlights();
  });
}

function setupDOMContentLoadedListener() {
  document.addEventListener("DOMContentLoaded", function () {
    runCode();
  });
}

// Function to set up the "Log In" button listener
function setupLoginButtonListener() {
  const loginButton = document.getElementById("loginButton");

  if (!loginButton) {
    console.error("Error: 'Log In' button not found.");
    return;
  }

  loginButton.addEventListener("click", openLoginDialog);
}

function setupButtonFunctionalityListeners() {
  // OLD BTT AND TTB BUTTONS
  //
  // document.querySelector('[name="btt"]').addEventListener("click", function () {
  //   pythontext.value = ""; // Clear the text area
  //   blockToText("box-container");
  // });
  // document.querySelector('[name="ttb"]').addEventListener("click", function () {
  //   textToBlock("box-container");
  // });
  document.getElementById("toggleButton").addEventListener("click", toggleView);
}


// ==========================
// 13. Saving and Loading Files
// ==========================

let currentFileName = null;

// Function to save or update a file in Firestore
function saveFile(filenameOverride = null) {
  const user = auth.currentUser;
  if (!user) {  //check if user is logged in
    showNotification("You must be logged in to save files.", "red");
    return;
  }

  let fileName = filenameOverride || currentFileName;   //check if updating an existing file

  if (!fileName) {
    const modal = document.getElementById("fileNameModal");
    const input = document.getElementById("fileNameInput");
  
    modal.style.display = "block";
    setTimeout(() => input.focus(), 100); // Wait a tick to ensure modal is visible
  
    return;
  }

  const fileContent = getCode();  //get the code from the editor
  if (!fileContent) {
    showNotification("File content cannot be empty.", "red");
    return;
  }

  const fileType = typeof fileName === "string" && fileName.endsWith(".py") ? "python" : "text";
  const userFilesRef = collection(db, "users", user.uid, "projects");
  if (typeof fileName !== "string") {
    showNotification("Invalid filename. Please save with a valid name.", "red");
    return;
  }
  const fileDoc = doc(userFilesRef, fileName);

  setDoc(fileDoc, {   //save the file in database
      name: fileName,
      code: fileContent,
      fileType: fileType,
      timestamp: serverTimestamp()
  })
  .then(() => {
      currentFileName = fileName; //remember the file name for future saves
      showNotification(`File "${fileName}" saved successfully!`, "green");
      
      // Update the file name display in the UI
      const fileNameDisplay = document.getElementById("file-name-display");
      if (fileNameDisplay) {
        fileNameDisplay.textContent = currentFileName;
      }  
  })
  .catch((error) => {
      console.error("Error saving file:", error);
      showNotification("Failed to save file. Try again.", "red");
  });
}

//event listener for save button (might move to SetUpApp() later)
document.getElementById("saveButton").addEventListener("click", () => {
  saveFile();
});

// Function to load a saved file from Firestore
function loadSavedFileFromDashboard() {
  const savedName = localStorage.getItem("loadedFileName");
  const savedCode = localStorage.getItem("loadedFileContent");

  if (savedName && savedCode) {
    currentFileName = savedName;
    document.getElementById("file-name-display").textContent = savedName;
    setCode(savedCode) // Load into the CodeMirror editor
    textToBlock("box-container"); // run textToBlock() to convert to blocks automatically
    showNotification(`Loaded "${savedName}" from dashboard.`, "blue");

    // Clean up so it doesn't reload every time
    localStorage.removeItem("loadedFileName");
    localStorage.removeItem("loadedFileContent");
  }
}

// ==========================
// 14. Additional Features (Resizing Columns, Dragging, etc.)
// ==========================

function setupColumnResizing() {
  let isDragging = false;
  let currentSpacer = null;
  let startX = 0;
  let startY = 0;
  let startWidthCol2 = 0;
  let startWidthCol3 = 0;
  let startHeightRow1 = 0;
  let startHeightRow2 = 0;

  const MIN_WIDTH1 = 100;
  const MIN_WIDTH2 = 200;
  const MIN_HEIGHT = 100;

  const spacer1 = document.querySelector(".handle1");
  const spacer2 = document.querySelector(".handle2");
  const spacer3 = document.querySelector(".handle3");
  const col1 = document.querySelector(".code-container");
  const col2 = document.querySelector(".result-container");
  const col3 = document.querySelector(".output-graph");
  const row1 = document.querySelector("#mycanvas");
  const row2 = document.querySelector("#output");

  // Toggle collapse states
  let isCol1Collapsed = false;
  let isCol3Collapsed = false;

  function startDrag(event, spacer) {
    isDragging = false;
    currentSpacer = spacer;
    startX = event.clientX;
    startY = event.clientY;
    startWidthCol2 = col2.offsetWidth;
    startWidthCol3 = col3.offsetWidth;
    startHeightRow1 = row1.offsetHeight;
    startHeightRow2 = row2.offsetHeight;

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  }

  function onDrag(event) {
    if (!currentSpacer) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    // If the mouse has moved significantly, consider it a drag
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      isDragging = true;
    }

    if (currentSpacer === spacer2) {
      const newWidthCol2 = startWidthCol2 + deltaX;
      const newWidthCol3 = startWidthCol3 - deltaX;

      // Ensure columns don't go below minimum width
      if (newWidthCol2 < MIN_WIDTH2 || newWidthCol3 < MIN_WIDTH1) return;

      col2.style.flexBasis = `${newWidthCol2}px`;
      col3.style.flexBasis = `${newWidthCol3}px`;
    }

    if (currentSpacer === spacer3) {
      const newHeightRow1 = startHeightRow1 + deltaY;
      const newHeightRow2 = startHeightRow2 - deltaY;

      // Ensure rows don't go below minimum height
      if (newHeightRow1 < MIN_HEIGHT || newHeightRow2 < MIN_HEIGHT) return;

      row1.style.flexBasis = `${newHeightRow1}px`;
      row2.style.flexBasis = `${newHeightRow2}px`;
    }
  }

  function stopDrag(event) {
    if (!isDragging && currentSpacer === spacer1) {
      isCol1Collapsed = !isCol1Collapsed;
      col1.classList.toggle("collapsed", isCol1Collapsed);
    } else if (!isDragging && currentSpacer === spacer2) {
      isCol3Collapsed = !isCol3Collapsed;
      col3.classList.toggle("collapsed", isCol3Collapsed);
    }

    // Reset dragging state
    isDragging = false;
    currentSpacer = null;

    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  // Add event listeners for dragging and clicking
  spacer1.addEventListener("mousedown", (e) => startDrag(e, spacer1));
  spacer2.addEventListener("mousedown", (e) => startDrag(e, spacer2));
  spacer3.addEventListener("mousedown", (e) => startDrag(e, spacer3));
}



function setupDraggableBlocks() {
  document.querySelectorAll(".box").forEach((box) => {
    box.draggable = true;
    box.addEventListener("dragstart", dragStart);
    box.addEventListener("dragover", dragOver);
    box.addEventListener("drop", drop);
    box.addEventListener("dragend", dragEnd);
  });

  // Prevent category buttons from closing the menu
  document.querySelectorAll(".category-blocks button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  // Handle block deletion when dragging over the left-side container
  const codeContainer = document.querySelector(".code-container");
  codeContainer.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  codeContainer.addEventListener("drop", function (event) {
    event.preventDefault();
    
    const container = document.querySelector(".code-container");
    container.classList.remove("drag-active");
    
    const message = container.querySelector(".drag-delete-message");
    if (message) message.style.display = "none";
  
    if (dragged) {
      dragged.remove();
      dragged = null;
    }
  });

  // Remove drop target highlight when dragging leaves a block
  document.addEventListener("dragleave", function (event) {
    const targetBlock = event.target.closest(".box");
    if (targetBlock) {
      targetBlock.classList.remove("drop-target");
    }
  });

  // Deselect block when clicking outside
  document.addEventListener("click", function (event) {
    if (highlightedBlock && !highlightedBlock.contains(event.target)) {
      highlightedBlock.classList.remove("selected");
      highlightedBlock = null;
    }
  });

  // Delete highlighted block with "Delete" key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && highlightedBlock) {
      dragged.remove();
      highlightedBlock = null;
    }
  });

  // Creates the drag message element
  document.addEventListener("DOMContentLoaded", () => {
  const codeContainer = document.querySelector(".code-container");

  const dragMessage = document.createElement("div");
  dragMessage.className = "drag-delete-message";
  dragMessage.textContent = "Drag here to delete";
  
  dragMessage.style.display = "none"; // Hide it initially

  codeContainer.appendChild(dragMessage); // Add to code container
});

// Function to handle drag start event
document.addEventListener("dragstart", (block) => {
  if (block.target.classList.contains("box")) {
    dragged = block.target;
    const container = document.querySelector(".code-container");
    container.classList.add("drag-active");

    const message = container.querySelector(".drag-delete-message");
    if (message) message.style.display = "block";
  }
});

// Function to handle drag end event
document.addEventListener("dragend", () => {
  const container = document.querySelector(".code-container");
  container.classList.remove("drag-active");

  const message = container.querySelector(".drag-delete-message");
  if (message) message.style.display = "none";
});
}


// ==========================
// 15. Miscellaneous Code
// ==========================

/*
function initializeMiscellaneous() {
  const pythonTextarea = document.getElementById("pythontext");
  ptext = pythonTextarea.value;

  const blockContainer = document.getElementById("box-container");

  let isRunning = false;

  document.getElementById("output").style.whiteSpace = "pre-wrap";
}
*/
// ==========================
// Main Initialization Function
// ==========================


document.addEventListener("DOMContentLoaded", function () {
  let tooltip;

  function createTooltip() {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip";
    Object.assign(tooltip.style, {
      position: "absolute",
      backgroundColor: "#333",
      color: "#fff",
      padding: "5px",
      borderRadius: "5px",
      fontSize: "12px",
      pointerEvents: "none",
      zIndex: "1000",
      display: "none"
    });
    document.body.appendChild(tooltip);
  }

  function showTooltip(event, text) {
    if (!tooltip) createTooltip();
    tooltip.innerText = text;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
    tooltip.style.display = "block";
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = "none";
  }

  function handleHover(event) {
    let target = event.target;
    if (target.closest(".category-blocks button")) {
      showTooltip(event, target.getAttribute("title") || "No description available");
    } else if (target.closest(".box")) {
      let block = target.closest(".box");
      let blockID = block.dataset.blockID;
      let description = blockID ? getBlockProperties(blockID)?.description || "No description available." : "Block ID not found.";
      showTooltip(event, description);
    }
  }

  document.body.addEventListener("mouseover", handleHover);
  document.body.addEventListener("mouseout", (event) => {
    if (event.target.closest(".category-blocks button") || event.target.closest(".box")) {
      hideTooltip();
    }
  });

  function addCodeContainer() {
    //future implementation of the categories
  }

});

function myFunction() {
  const burgerMenu = document.getElementById("burgerMenu");
  if (burgerMenu.style.display === "none" || burgerMenu.style.display === "") {
    burgerMenu.style.display = "flex";
  } else {
    burgerMenu.style.display = "none";
  }
}

function setUpApp() {
  setupKeydownListener();
  setupDOMContentLoadedListener();
  setupLoginButtonListener();
  setupButtonFunctionalityListeners();
  setupColumnResizing();
  setupDraggableBlocks();
  setupClearHighlightsOnClickListener();
  loadSavedFileFromDashboard();
  setupFileNameModalEvents();
  setUpTutorialListener();
  //initializeMiscellaneous();
}

// Call the main initialization function
setUpApp();

/* NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE
// Run Code button logic for swapping between Run/Stop
function toggleRunButton() {
    const button = document.getElementById("run-code-btn");
    const icon = button.querySelector("i");

    if (button.classList.contains("stop")) {
        button.classList.remove("stop");
        button.style.backgroundColor = "green"; // Change to green
        icon.className = "icon-play"; // Change icon to play
        button.setAttribute("data-tooltip", "Run Program (Ctrl+Enter)"); // Update tooltip
        stopCode();
        isRunning = false; // Update running state
    } else {
        button.classList.add("stop");
        button.style.backgroundColor = "red"; // Change to red
        icon.className = "icon-stop"; // Change icon to stop
        button.setAttribute("data-tooltip", "Stop Program (Ctrl+Enter)"); // Update tooltip
        runCode();
        isRunning = true; // Update running state
    }
}
*/

/* NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE
// placeholder function: stop code
function stopCode() {
    isRunning = false; // reset flag

    // REPLACE BELOW WITH FUTURE IMPLEMENTATION LATER
    console.log("test: code stopped");
}
// Placeholder end
*/
