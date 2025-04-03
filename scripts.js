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

import {
  openLoginDialog,
  createLoginDialog,
  createSignupDialog,
  attemptLogin,
  attemptSignup,
  logoutUser,
  closeDialogBoxes
} from "./scripts/authDialogs.js";


// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCteFAmh1TjbbQB0hsbBwcbqwK8mofMO4Y",
  authDomain: "b-coders-database.firebaseapp.com",
  projectId: "b-coders-database",
  storageBucket: "b-coders-database.appspot.com",
  messagingSenderId: "268773123996",
  appId: "1:268773123996:web:fec77ef63557a9c6b50a59",
  measurementId: "G-92LTT20BXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

function blockToText(pc) {
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

  let tDepth = 0;
  // let colonC = 0;

  for (let i = 0; i < blockChildElements.length; i++) {
    let curBlock = blockChildElements[i];


    // else{
    //   tDepth = curBlock.dataset.blockDepth;
    // }

    if (curBlock.dataset.blockID == "if" || curBlock.dataset.blockID == "for" || curBlock.dataset.blockID == "while") {
      // colonC = 1;
      // tDepth += 1;
      // if(curBlock.dataset.blockDepth != tDepth || curBlock.dataset.blockDepth){
      //   pythontext.value += ":\n";
      // }
      if (tDepth != 0) {
        textBuilder += ":\n";
      }

      for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
        textBuilder += "  ";
      }
      textBuilder += `${curBlock.dataset.blockID}`;
      tDepth = curBlock.dataset.blockDepth;
    }
    else if (curBlock.innerText == "else if:" || curBlock.innerText == "else:") {
      textBuilder += "\n";
      for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
        textBuilder += "  ";
      }
      if (curBlock.innerText == "else if:") {
        textBuilder += "else if";
        // colonC = 1;
        tDepth = curBlock.dataset.blockDepth;
      }
      else if (curBlock.innerText == "else:") {
        textBuilder += `${curBlock.innerText}` + "\n"
      };
    }


    if (curBlock.className == "block-dropdown") {
      if (curBlock.dataset.blockDepth > tDepth) {
        textBuilder += ":\n";
        for (let d = 0; d < (curBlock.dataset.blockDepth - 1); d++) {
          textBuilder += "  ";
        }
        textBuilder += `${curBlock.value}`
        tDepth = curBlock.dataset.blockDepth;
      }
      else {
        textBuilder += " " + `${curBlock.value}`;
      }
    }

    if (curBlock.className == "text-input") {
      if (curBlock.dataset.blockDepth > tDepth) {
        textBuilder += ":\n";
        tDepth = curBlock.dataset.blockDepth;
      }
      textBuilder += " " + `${curBlock.value}`;
    }
    if (curBlock.className == "math-input") {
      if (curBlock.dataset.blockDepth > tDepth) {
        textBuilder += ":\n";
        tDepth = curBlock.dataset.blockDepth;
      }
      textBuilder += " " + `${curBlock.value}`;
    }


  }
  let yyyyy = "THIS IS TEXT";


  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: textBuilder
    }
  })

} // END OF BTT()

// Function to convert text programming to block programming
function textToBlock(container) {
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

      if (tokens[0] == "if" || tokens[0] == "while" || tokens[0] == "for" || tokens[1] == "if") {


        console.log(`${tokens[0]}` + " statement");
        let nbCons;
        let nbRef;

        // Logic for else if blocks
        if (tokens[1] == "if") {
          console.log('depthBuilder: ' + `${depthBuilder}`);
          let tempIf = document.getElementById(depthBuilder[currDepth]);
          tempIf.querySelector(".fa-solid").dispatchEvent(clickEvent);
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
        tempIf.querySelector(".fa-solid").dispatchEvent(clickEvent);
        let elDrops = tempIf.querySelectorAll(".dropdown-item");
        console.log(elDrops);
        elDrops[1].dispatchEvent(clickEvent);

      }



      // building CONTINUE and BREAK
      else if (tokens[0] == "continue" || tokens[0] == "break") {
        console.log(tokens[0]);
        let nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock
        nbRef.dataset.blockDepth = currDepth;
        depthBuilder[currDepth] = nbRef;
        console.log(depthBuilder);

        if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-if-elif-else-id") > "0") {
          console.log("PARENT IS AN ELSE")
          let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
          parentBlock[parentBlock.length - 1].append(document.getElementById(nbCons));
        }
        else {
          let parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
          parentBlock.append(document.getElementById(nbCons));
        }
      }

      else {
        let parentBlock;
        if (document.getElementById(depthBuilder[currDepth - 1]).getAttribute("data-else-if-count") > "0") {
          console.log("PARENT IS AN ELSE")
          let nbRef = document.getElementById(depthBuilder[currDepth - 1]).querySelectorAll(".child-box-container");
          parentBlock = nbRef[nbRef.length - 1];
        }
        else {
          parentBlock = document.getElementById(depthBuilder[currDepth - 1]).querySelector(".child-box-container");
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
  let oArray = arr;
  let rmBlock = [];
  let retArray = [];
  let arrCount = 0;
  let block_T;
  for (let i = 0; i < oArray.length; i++) {



    if (oArray[i] == "or" || oArray[i] == "||" || oArray[i] == "and" || oArray[i] == "&&" || oArray[i] == "not") {
      let nbCons = newBlock("logicalOps"); // newblock construction based on keyword
      let nbRef = document.getElementById(nbCons); // created reference to newblock
      rmBlock.push(document.getElementById(nbCons));
      nbRef.querySelector(".block-dropdown").value = oArray[i]


      if (oArray[i - 1] >= "0" && oArray[i - 1] <= "9") {
        let tempNb = newBlock("mathText");
        let tempRef = document.getElementById(tempNb);
        let mathInput = tempRef.querySelector(".math-input")
        mathInput.value = oArray[i - 1];
        tempRef.dataset.blockValue = oArray[i - 1];

        rmBlock[arrCount - 1].append(tempRef);
      }
      else {
        let nbComp = newBlock("printText");
        let elText = document.getElementById(nbComp);
        elText.querySelector(".text-input").value += oArray[i - 1];
        compElems.append(elText);
      }



    }

    else if (oArray[i] == "=" || oArray[i] == "+=" || oArray[i] == "-=" || oArray[i] == "*=" || oArray[i] == "/=") {
      if (!userVariables.includes(oArray[i - 1])) {
        userVariables.push(oArray[i - 1]);
      }

      // console.log("IT EQUALS");
      let nbComp = newBlock("varOps");
      let nbRef = document.getElementById(nbComp);
      let nbHz = nbRef.querySelector(".childBox-Container-Horizontal")
      nbRef.querySelector(".block-dropdown").value = oArray[i];


      let tempVar = newBlock("variableBlock");
      let varRef = document.getElementById(tempVar);
      varRef.querySelector(".block-dropdown").value = oArray[i - 1];
      nbHz.childNodes[0].append(varRef);

      retArray[arrCount] = nbHz;
      arrCount++;

      rmBlock.push(nbRef);

    }

    else if (oArray[i] == "in") {
      let nbComp = newBlock("printText");
      let elText = document.getElementById(nbComp);
      elText.querySelector(".text-input").value += oArray[i - 1] + " ";
      elText.querySelector(".text-input").value += oArray[i] + " ";
      elText.querySelector(".text-input").value += oArray[i + 1];
      rmBlock.push(elText);
    }
    else if (i < oArray.length - 1) {
      if (oArray[i] == "==" || oArray[i] == "!=" || oArray[i] == ">=" || oArray[i] == "<=" || oArray[i] == "<" || oArray[i] == ">") {
        block_T = "comparisonBlock";
      }
      else if (oArray[i] == "+" || oArray[i] == "-" || oArray[i] == "*" || oArray[i] == "/" || oArray[i] == "%" || oArray[i] == "**" || oArray[i] == "//") {
        block_T = "mathBlock";
      }
      else {
        block_T = "";
        continue;
      }
      let nbComp = newBlock(block_T);
      console.log("nbComp: " + `${nbComp}`);

      let compElems = document.getElementById(nbComp).querySelector(".childBox-Container-Horizontal"); // comparison/math block node
      console.log("compElems: " + `${compElems}`);

      let compElems2 = compElems.querySelectorAll("*");
      console.log("compElems2: " + `${compElems2}`);

      console.log("compElems2 length: " + `${compElems2.length}`);


      if (block_T == "comparisonBlock") {
        rmBlock.push(document.getElementById(nbComp));

      }
      if (oArray[i - 1] >= "0" && oArray[i - 1] <= "9") {
        let tempNb = newBlock("mathText");
        let tempRef = document.getElementById(tempNb);
        let mathInput = tempRef.querySelector(".math-input")
        mathInput.value = oArray[i - 1];
        tempRef.dataset.blockValue = oArray[i - 1];

        compElems2[0].append(tempRef);
      }
      else {
        let nbComp = newBlock("printText");
        let elText = document.getElementById(nbComp);
        elText.querySelector(".text-input").value += oArray[i - 1];
        compElems2[0].append(elText);
        //compElems[0].append(elText);
      }

      let elDrop = compElems.querySelector(".block-dropdown");
      elDrop.value = oArray[i];



      console.log('i: ' + `${i}`);

      retArray[arrCount] = compElems;
      if (retArray.length > 1) {
        retArray[arrCount - 1].append(document.getElementById(nbComp));
      }


      arrCount++;
      //rmBlock = document.getElementById(nbComp);
      console.log("retArray: " + `${retArray}`);


    }

    else if (i == oArray.length - 1) {
      if (oArray[i] >= "0" && oArray[i] <= "9") {
        let nbComp = newBlock("mathText");
        let nbRef = document.getElementById(nbComp);
        let mathInput = nbRef.querySelector(".math-input")
        mathInput.value = oArray[i];
        nbRef.dataset.blockValue = oArray[i];
        rmBlock[0].querySelectorAll(".childBox-Container-Horizontal .child-box-container-horizontal")[1].append(nbRef);


        // let rCont = rmBlock.querySelectorAll(".childbox-container-horizontal");
        // console.log(rCont);

      }
    }

  } // end for loop over array of tokens

  console.log('return array: ');
  console.log(rmBlock);
  console.log('return container: ' + `${container}`);
  for (let i = 0; i < rmBlock.length; i++) {
    container.appendChild(rmBlock[i]);
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

document.getElementById("run-code-btn").addEventListener("click", runCode);

// Function to run the Python code
function runCode() {
  var prog = getCode();
  var mypre = document.getElementById("output"); // Output area
  mypre.innerHTML = ""; // Clear previous output

  Sk.pre = "output";
  console.log(Sk);
  Sk.configure({ output: outf, read: builtinRead });
  (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";

  //KEEP INDENTS AS IS FOR PYTHON CODE; DO NOT CHANGE turtleSetupCode
  var turtleSetupCode = `
import turtle
import math
`;

  var cleanedProg = prog.trimStart();
  console.log("user code:", prog);
  var fullProg = turtleSetupCode + "\n" + cleanedProg;
  console.log("Combined code:", fullProg);

  var myPromise = Sk.misceval.asyncToPromise(function () {
    return Sk.importMainWithBody("<stdin>", false, fullProg, true);
  });
}

window.runCode = runCode;

// Function to handle the output of the Python code
function outf(text) {
  var mypre = document.getElementById("output");
  mypre.innerHTML += text.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
}

// Function to read built-in files
function builtinRead(x) {
  if (
    Sk.builtinFiles === undefined ||
    Sk.builtinFiles["files"][x] === undefined
  )
    throw "File not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
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
  document.querySelector('[name="btt"]').addEventListener("click", function () {
    pythontext.value = ""; // Clear the text area
    blockToText("box-container");
  });
  document.querySelector('[name="ttb"]').addEventListener("click", function () {
    textToBlock("box-container");
  });
  document.getElementById("toggleButton").addEventListener("click", toggleView);
}

// ==========================
// 12. Login Updates
// ==========================

// Function to update the UI after user login/logout
export function updateUIAfterLogin(user) {
  const loginButton = document.getElementById("loginButton");

  if (user) {
    loginButton.textContent = "Log Out";
    loginButton.removeEventListener("click", openLoginDialog);
    loginButton.addEventListener("click", logoutUser);
  } else {
    loginButton.textContent = "Log In";
    loginButton.removeEventListener("click", logoutUser);
    loginButton.addEventListener("click", openLoginDialog);
  }
}

export function showNotification(message, color = "gold") {
  // Remove existing notification if present
  const existingNotification = document.getElementById("notification-box");
  if (existingNotification) existingNotification.remove();

  // Create notification container
  const notification = document.createElement("div");
  notification.id = "notification-box";
  notification.classList.add("notification");
  notification.style.backgroundColor = color;

  // Create notification text
  const messageText = document.createElement("span");
  messageText.textContent = message;

  // Create close button (X)
  const closeButton = document.createElement("span");
  closeButton.textContent = "✖";
  closeButton.classList.add("close-button");
  closeButton.addEventListener("click", () => fadeOutNotification(notification));

  // Append elements to notification
  notification.appendChild(messageText);
  notification.appendChild(closeButton);
  document.body.appendChild(notification);

  // Timer to fade out and remove notification
  let removeTimeout = setTimeout(() => {
    fadeOutNotification(notification);
  }, 3000); // 3 seconds

  // Pause timer when hovering
  notification.addEventListener("mouseenter", () => clearTimeout(removeTimeout));

  // Resume timer when mouse leaves
  notification.addEventListener("mouseleave", () => {
    removeTimeout = setTimeout(() => fadeOutNotification(notification), 3000);
  });
}

// Function to fade out notification before removing it
function fadeOutNotification(notification) {
  notification.classList.add("fade-out");
  setTimeout(() => notification.remove(), 500); // Wait for fade-out transition
}


// ==========================
// 13. Saving and Loading Files
// ==========================

let currentFileName = null;

// Function to save or update a file in Firestore
function saveFile() {
  const user = auth.currentUser;
  if (!user) {  //check if user is logged in
    showNotification("You must be logged in to save files.", "red");
    return;
  }

  let fileName = currentFileName;   //check if updating an existing file
  if (!fileName) {
    fileName = prompt("Enter a file name (e.g., my_script.py):");
    if (!fileName) return; //if user cancels, do nothing
  }

  const fileContent = getCode();  //get the code from the editor
  if (!fileContent) {
    showNotification("File content cannot be empty.", "red");
    return;
  }

  const fileType = fileName.endsWith(".py") ? "python" : "text";  //allows saving as .py or .txt
  const userFilesRef = collection(db, "users", user.uid, "projects");
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
  })
  .catch((error) => {
      console.error("Error saving file:", error);
      showNotification("Failed to save file. Try again.", "red");
  });
}

//event listener for save button (might move to SetUpApp() later)
document.getElementById("saveButton").addEventListener("click", saveFile);

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
    if (dragged) {
      removeBlock(dragged.id); // Use removeBlock to delete the block
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
      removeBlock(highlightedBlock.id); // Use removeBlock to delete the block
      highlightedBlock = null;
    }
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
