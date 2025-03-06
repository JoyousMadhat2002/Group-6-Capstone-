import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";

import { blockCategory } from "./scripts/blockConfiguration.js";
import { getBlockProperties } from "./scripts/blockProperties.js";
import { 
  createCategoryButtons, 
  newBlock,
  clearDropHighlights,
  toggleView
} from "./scripts/blockCreation.js";


// Import Firebase modules correctly
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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


// Call the function to create the buttons
createCategoryButtons(blockCategory);

// ==========================
// 9. Python Code Conversion
// ==========================

function blockToText(pc) {
  //pythontext.value = ""; // Clear the text area

  let parentContainer = document.getElementById(pc);

  
  
  let blockChildElements = parentContainer.querySelectorAll("*");

  // set all depth to 0
  for(let i = 0; i < blockChildElements.length; i++){
    blockChildElements[i].dataset.blockDepth = 0;
  }


  // iterate through every element and recalculate depth
  for(let i = 0; i < blockChildElements.length; i++){
    let curBlock = blockChildElements[i];

    
    
      if(curBlock.parentElement.dataset.blockID == "if" || curBlock.parentElement.dataset.blockID == "for" || curBlock.parentElement.dataset.blockID == "when"){
      curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);

    }
    else if(curBlock.parentElement.className == "child-box-container" || curBlock.parentElement.className == "block-code-result"){
      if(curBlock.dataset.blockID == "comparisonBlock" || curBlock.className == "block-dropdown" || curBlock.dataset.blockID == "mathText"){
        curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);


      }
      else{
        curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth) + 1;

      }


    }

    //logic for adding continue and break to text block
    else if (childID == "continue" || childID == "break") {
      pythontext.value += `${childID}\n`;
    }

    // else {
    //   pythontext.value += `${childID}\n`;
    // }
    else{
      curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);
    }

  } // end of depth recalculation

  let tDepth = 0;
  // let colonC = 0;

  for(let i = 0; i < blockChildElements.length; i++){
    let curBlock = blockChildElements[i];
    
    
    // else{
    //   tDepth = curBlock.dataset.blockDepth;
    // }
    
    if(curBlock.dataset.blockID == "if" || curBlock.dataset.blockID == "for" || curBlock.dataset.blockID == "while"){
      // colonC = 1;
      // tDepth += 1;
      // if(curBlock.dataset.blockDepth != tDepth || curBlock.dataset.blockDepth){
      //   pythontext.value += ":\n";
      // }
      if(tDepth != 0){
        pythontext.value += ":\n";
      }

      for(let d = 0 ; d < (curBlock.dataset.blockDepth-1);d++){
        pythontext.value += "    ";
      }
      pythontext.value += `${curBlock.dataset.blockID}`;
      tDepth = curBlock.dataset.blockDepth;
    }
    else if(curBlock.innerText == "else if:" || curBlock.innerText == "else:"){
      pythontext.value += ":\n";
      for(let d = 0 ; d < (curBlock.dataset.blockDepth-1);d++){
        pythontext.value += " ";
      }
      if(curBlock.innerText == "else if:"){
        pythontext.value += "else if";
        // colonC = 1;
        tDepth = curBlock.dataset.blockDepth;
      }
      else if( curBlock.innerText == "else:"){
      pythontext.value += `${curBlock.innerText}` + "\n";
    }
   
    }
  if(curBlock.className == "block-dropdown"){
    if(curBlock.dataset.blockDepth > tDepth){
      pythontext.value += ":\n";
      pythontext.value += "   "
      tDepth = curBlock.dataset.blockDepth;
    }
    pythontext.value += " " + `${curBlock.value}`;
    
  }

  if(curBlock.className == "text-input"){
    if(curBlock.dataset.blockDepth > tDepth){
      pythontext.value += ":\n";
      tDepth = curBlock.dataset.blockDepth;
    }
    pythontext.value += " " + `${curBlock.value}`;
  }
  if(curBlock.className == "math-input"){
    if(curBlock.dataset.blockDepth > tDepth){
      pythontext.value += ":\n";
      tDepth = curBlock.dataset.blockDepth;
    }
    pythontext.value += " " + `${curBlock.value}`;
  }
  
  
}
} // END OF BBT()

// Function to convert text programming to block programming
function textToBlock(container) {
  // let text = pythontext.value;
  let text = editor.state.doc.text;
  if (container == "box-container") {
    document.getElementById(container).innerHTML = ""; // Clear block container
  }
  console.log(text);

  let lines = text; // Separate lines for parsing

  let depthBuilder = ["box-container"]; // counting preceeding zeros for depth
  
  for (let i = 0; i < lines.length; i++) {
    let currDepth = 0;
    let linecount = 0;
    for (let j = 0; j < lines[i].length; j++){
      
      if(lines[i][j] ==  " "){
        linecount++;
      }
      else {
        break;
      }
    }


    // setting currDepth based on number of indentations
    if (linecount < 1){
      console.log(linecount);
      console.log(currDepth);

      currDepth = 1;
      
      
    }
    else {
      console.log(linecount);
      console.log(currDepth);
      currDepth = (linecount/4) + 1;
    }

    lines[i] = lines[i].trim(); // trimming text line for whitespace

    // Line deleting colon for statements
    if(lines[i][lines[i].length -1] == ':'){
      lines[i] = lines[i].substring(0, lines[i].length -1);
    }

    let tokens = lines[i].split(" "); // splitting string into tokens

    // logic to build blocks
    if (tokens != ""){
      
      if (tokens[0] == "if" || tokens[0] == "while" || tokens[0] == "for" || tokens[1] == "if"){
        

        console.log(`${tokens[0]}` + " statement");
        let nbCons;
        let nbRef;
        let elseChild;
        
        // Logic for else if blocks
        if(tokens[1] == "if"){
          let tempIf = document.getElementById(depthBuilder[currDepth]);
          tempIf.querySelector(".fa-solid").dispatchEvent(clickEvent);
          let elDrops = tempIf.querySelectorAll(".dropdown-item");
          elDrops[0].dispatchEvent(clickEvent);

          // let elseRef = document.getElementById(depthBuilder[currDepth]).getAttribute('data-if-elif-else-id');
          // console.log(elseRef);
          let elseRef = document.getElementById(depthBuilder[currDepth]).querySelectorAll(".child-box-container");
          for(let k = 0; k < elseRef.length; k++){
            if(elseRef[k].getAttribute("data-if-elif-else-id") == "1"){
              elseChild = elseRef[k];
            }
          }
          let horRef = document.getElementById(depthBuilder[currDepth]).querySelectorAll(".child-box-container-horizontal");
          console.log(horRef[horRef.length -1]);
          nbRef = horRef[horRef.length -1];
          blockBuilder(tokens, nbRef);
        }
        else{
        nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        nbRef = document.getElementById(nbCons); // created reference to newblock
        depthBuilder[currDepth] = nbRef.id; // put block reference into depth array
        nbRef.dataset.blockDepth = currDepth; // update depth of block
        console.log(depthBuilder);
        

        if(depthBuilder[currDepth-1] != "box-container"){
          if(document.getElementById(depthBuilder[currDepth-1]).getAttribute("data-if-elif-else-id") == "1"){
            console.log("PARENT IS AN ELSE")
            let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelectorAll(".child-box-container");
            parentBlock[parentBlock.length-1].append(document.getElementById(nbCons));
          }
          else{
          let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelector(".child-box-container");
          parentBlock.append(document.getElementById(nbCons));
          
          }
        }
        blockBuilder(tokens, nbRef.querySelector(".child-box-container-horizontal"))
        }
        let j = 1

      }

      else if(tokens[0] == "else" && tokens.length == 1){
        let tempIf = document.getElementById(depthBuilder[currDepth]);
        tempIf.querySelector(".fa-solid").dispatchEvent(clickEvent);
        let elDrops = tempIf.querySelectorAll(".dropdown-item");
        console.log(elDrops);
        elDrops[1].dispatchEvent(clickEvent);

      }
              
      

      // building CONTINUE and BREAK
      else if(tokens[0] == "continue" || tokens[0] == "break"){
        console.log(tokens[0]);
        let nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock
        nbRef.dataset.blockDepth = currDepth;
        depthBuilder[currDepth] = nbRef;
        console.log(depthBuilder);

        if(document.getElementById(depthBuilder[currDepth-1]).getAttribute("data-if-elif-else-id") > "0"){
          console.log("PARENT IS AN ELSE")
          let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelectorAll(".child-box-container");
          parentBlock[parentBlock.length-1].append(document.getElementById(nbCons));
        }
        else{
        let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelector(".child-box-container");
        parentBlock.append(document.getElementById(nbCons));
        }
      }

      else{
        let parentBlock;
        if(document.getElementById(depthBuilder[currDepth-1]).getAttribute("data-if-elif-else-id") > "0"){
          console.log("PARENT IS AN ELSE")
          let nbRef = document.getElementById(depthBuilder[currDepth-1]).querySelectorAll(".child-box-container");
          parentBlock = nbRef[nbRef.length-1];
        }
        else{
          parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelector(".child-box-container");
        }

        
        
        blockBuilder(tokens, parentBlock);
        console.log("END OF ALL ELSE");
      }

    }
  }
    
  } // END OF TTB()

  function blockBuilder(arr, container){
    let oArray = arr;
    let rmBlock = [];
    let retArray = [];
    let arrCount =0;
    let block_T;
    for(let i = 0; i < oArray.length;i++){
      
    

      if(oArray[i] == "or" || oArray[i] == "||" || oArray[i] == "and" || oArray[i] == "&&" || oArray[i] == "not"){
        let nbCons = newBlock("logicalOps"); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock
        rmBlock.push(document.getElementById(nbCons));
        nbRef.querySelector(".block-dropdown").value = oArray[i]  


        if(oArray[i-1] >= "0" && oArray[i-1] <= "9"){
          let tempNb = newBlock("mathText");
          let tempRef = document.getElementById(tempNb);
          let mathInput = tempRef.querySelector(".math-input") 
          mathInput.value = oArray[i-1];
          tempRef.dataset.blockValue = oArray[i-1];
  
          retArray[arrCount-1].append(tempRef);
        }
        else{
          let nbComp = newBlock("printText");
          let elText = document.getElementById(nbComp);
          elText.querySelector(".text-input").value += oArray[i-1];
          compElems[0].append(elText);
        }
        

  
      }

      else if(oArray[i] == "=" || oArray[i] == "+=" || oArray[i] == "-=" || oArray[i] == "*=" || oArray[i] == "/="){
        if(!userVariables.includes(oArray[i-1])){
          userVariables.push(oArray[i-1]);
        }
        
        console.log("IT EQUALS");
        let nbComp = newBlock("varOps");
        let nbRef = document.getElementById(nbComp);
        let nbHz = nbRef.querySelector(".childBox-Container-Horizontal")
        console.log('nbHz: ' + `${nbHz}`);
        console.log('nbHz MCI: ' + `${nbHz.querySelector(".math-comparison-input")}`);
        console.log(nbHz.childNodes[1]);
        nbHz.childNodes[1].value = oArray[i];

        retArray[arrCount] = nbHz;
        arrCount++;

        rmBlock.push(nbRef);

      }

      else if(oArray[i] == "in"){
        let nbComp = newBlock("printText");
        let elText = document.getElementById(nbComp);
        elText.querySelector(".text-input").value += oArray[i-1] + " ";
        elText.querySelector(".text-input").value += oArray[i] + " ";
        elText.querySelector(".text-input").value += oArray[i+1];
        rmBlock.push(elText);
      }
      else if(i < oArray.length-1){
      if(oArray[i] == "==" || oArray[i] == "!=" || oArray[i]  == ">=" || oArray[i]  == "<=" || oArray[i]  == "<" || oArray[i]  == ">"){
        block_T = "comparisonBlock";
      }
      else if(oArray[i] == "+" || oArray[i] == "-" || oArray[i]  == "*" || oArray[i]  == "/" || oArray[i]  == "%" || oArray[i]  == "**" || oArray[i]  == "//"){
        block_T = "mathBlock";
      }
      else{
        block_T = "";
        continue;
      }
      let nbComp = newBlock(block_T);
      let compElems = document.getElementById(nbComp).querySelectorAll(".childBox-Container-Horizontal");


      if(block_T == "comparisonBlock"){
        rmBlock.push(document.getElementById(nbComp));

      }
      if(oArray[i-1] >= "0" && oArray[i-1] <= "9"){
        let tempNb = newBlock("mathText");
        let tempRef = document.getElementById(tempNb);
        let mathInput = tempRef.querySelector(".math-input") 
        mathInput.value = oArray[i-1];
        tempRef.dataset.blockValue = oArray[i-1];

        compElems[0].appendChild(tempRef);
      }
      else{
        let nbComp = newBlock("printText");
        let elText = document.getElementById(nbComp);
        elText.querySelector(".text-input").value += oArray[i-1];
        console.log("compElems: " + `${compElems}`);
        //compElems[0].append(elText);
      }
            
      let elDrop = compElems[0].querySelector(".block-dropdown");
      elDrop.value = oArray[i];

      
      
      console.log('i: ' + `${i}`);

      retArray[arrCount] = compElems[2];
      if(retArray.length > 1){
        retArray[arrCount-1].append(document.getElementById(nbComp));
      }

      
      arrCount++;
      //rmBlock = document.getElementById(nbComp);
      console.log(retArray);
      

    }

    else if(i==oArray.length-1){
      if(oArray[i] >= "0" && oArray[i] <= "9"){
        let nbComp = newBlock("mathText");
        let nbRef = document.getElementById(nbComp);
        let mathInput = nbRef.querySelector(".math-input") 
        mathInput.value = oArray[i];
        nbRef.dataset.blockValue = oArray[i];

        retArray[arrCount-1].appendChild(nbRef);

      }
    }

    } // end for loop over array of tokens

    console.log('return array: ');
    console.log(rmBlock);
    for(let i = 0; i < rmBlock.length; i++){
      container.appendChild(rmBlock[i]);
    }
  } // end blockBuilder()



// function toggleView() {
//   var x = document.getElementById("python-code-result");
//   var y = document.getElementById("box-container");
//   var toggleButton = document.getElementById("toggleButton");


//   }



// ==========================
// 10. Code Execution
// ==========================

const editor = new EditorView({
  parent: document.getElementById("pythontext"),
  extensions: [basicSetup, python()],
});

function getCode() {
  return editor.state.doc.toString();
}

document.getElementById("run-code-btn").addEventListener("click", runCode);

// Function to run the Python code
function runCode() {
  console.log("test: code running");
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
t = turtle.Turtle()
t.shape("turtle")
t.color("green")
t.setheading(90)
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

function setupSaveButtonListener() {
  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", function () {
    const pythonCode = document.getElementById("pythontext").value;
    localStorage.setItem("savedCode", pythonCode);
    alert("Code saved locally!");
  });
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
// 12. Login and Logout
// ==========================

// Function to attempt user login
function attemptLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorMsg = document.getElementById("login-error");

  if (!email || !password) {
      errorMsg.textContent = "Please enter email and password.";
      errorMsg.classList.remove("hidden");
      return;
  }

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
      console.log("User logged in:", userCredential.user);
      closeDialogBoxes(); // Close the login dialog
      updateUIAfterLogin(userCredential.user); // Update the UI
      showNotification("Successfully logged in!", "green");
  })
  .catch((error) => {
      console.error("Login Error:", error.message);
      errorMsg.textContent = error.message;
      errorMsg.classList.remove("hidden");
      showNotification("Login failed. Please try again.", "red");
  });
}

// Function to open the login dialog
function openLoginDialog() {
  if (!document.getElementById("login-dialog")) {
      createLoginDialog();
  }
}

// Function to attempt user signup
function attemptSignup() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const errorMsg = document.getElementById("signup-error");

  if (!email || !password) {
      errorMsg.textContent = "Please enter an email and password.";
      errorMsg.classList.remove("hidden");
      return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed up:", userCredential.user);
      closeDialogBoxes(); // Close signup dialog
      updateUIAfterLogin(userCredential.user); // Update UI
      showNotification("Account created successfully!", "blue");
    })
    .catch((error) => {
      console.error("Signup Error:", error.message);
      errorMsg.textContent = error.message;
      errorMsg.classList.remove("hidden");
      showNotification("Signup failed. Please try again.", "red");
    });
}


// Function to create the login dialog
function createLoginDialog() {
  closeDialogBoxes(); // Close any existing login dialog
  
  const loginDialog = document.createElement("div");
  loginDialog.id = "login-dialog";
  loginDialog.classList.add("dialog-container");

  // Create the login dialog content (makes HTML file cleaner by not having to include this in the main HTML file)
  loginDialog.innerHTML = `
      <div class="dialog-box">
          <h2>Log In</h2>
          <label for="login-email">Email:</label>
          <input type="email" id="login-email" placeholder="Enter your email">

          <label for="login-password">Password:</label>
          <input type="password" id="login-password" placeholder="Enter your password">

          <p id="login-error" class="error-message hidden"></p>

          <p class="switch-auth">
            <span>Don't have an account?</span><br>
            <span id="switch-to-signup" class="auth-link">Click here to make an account!</span>
          </p>

          <div class="dialog-buttons">
              <button id="login-submit">Log In</button>
              <button id="login-cancel">Cancel</button>
          </div>
      </div>
  `;

  document.body.appendChild(loginDialog);

  // Add event listeners
  document.getElementById("login-submit").addEventListener("click", attemptLogin);
  document.getElementById("login-cancel").addEventListener("click", closeDialogBoxes);
  document.getElementById("switch-to-signup").addEventListener("click", createSignupDialog);

  // Add event listeners for pressing "Enter" key
  document.getElementById("login-email").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      attemptLogin();
    }
  });

  document.getElementById("login-password").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      attemptLogin();
    }
  });

  // Add event listener to close dialog when clicking outside the dialog box
  loginDialog.addEventListener("click", function (event) {
    if (event.target === loginDialog) {
      closeDialogBoxes();
    }
  });
}

// Function to create Signup dialog
function createSignupDialog() {
  closeDialogBoxes(); // Close any existing login dialog

  const loginDialog = document.getElementById("login-dialog");
  if (loginDialog) loginDialog.remove(); // Remove login form

  const signupDialog = document.createElement("div");
  signupDialog.id = "login-dialog";
  signupDialog.classList.add("dialog-container");

  signupDialog.innerHTML = `
      <div class="dialog-box" id="signup-box">
        <h2>Create an Account</h2>
        <label for="signup-email">Email:</label>
        <input type="email" id="signup-email" placeholder="Enter your email">

        <label for="signup-password">Password:</label>
        <input type="password" id="signup-password" placeholder="Enter your password">

        <p id="signup-error" class="error-message hidden"></p>

        <p class="switch-auth">Already have an account? 
            <span id="switch-to-login" class="auth-link">Click here to log in</span>
        </p>

        <div class="dialog-buttons">
            <button id="signup-submit">Sign Up</button>
            <button id="signup-cancel">Cancel</button>
        </div>
      </div>
  `;

  document.body.appendChild(signupDialog);

  // Add event listeners
  document.getElementById("signup-submit").addEventListener("click", attemptSignup);
  document.getElementById("signup-cancel").addEventListener("click", closeDialogBoxes);
  document.getElementById("switch-to-login").addEventListener("click", createLoginDialog);

  signupDialog.addEventListener("click", function (event) {
    if (event.target === signupDialog) {
      closeDialogBoxes();
    }
  });
}


// Function to close the login dialog
function closeDialogBoxes() {
  const existingDialogs = document.querySelectorAll(".dialog-container");
  existingDialogs.forEach(dialog => dialog.remove());
}

// Function to update the UI after user login/logout
function updateUIAfterLogin(user) {
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

// Function to log out the current user
function logoutUser() {
  auth.signOut()
    .then(() => {
      console.log("User logged out");
      updateUIAfterLogin(null); // Reset UI
      showNotification("Logged out successfully!", "gray");
    })
    .catch((error) => {
      console.error("Logout Error:", error.message);
      showNotification("Error logging out. Try again.", "red");
    });
}

function showNotification(message, color = "gold") {
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
// 13. Additional Features (Resizing Columns, Dragging, etc.)
// ==========================

function setupColumnResizing() {
  let isDragging = false;
  let currentSpacer = null;
  let startX = 0;
  let startWidthCol1 = 0;
  let startWidthCol2 = 0;
  let startWidthCol3 = 0;

  const MIN_WIDTH1 = 100;
  const MIN_WIDTH2 = 200;

  const spacer1 = document.querySelector(".handle1");
  const spacer2 = document.querySelector(".handle2");
  const col1 = document.querySelector(".code-container");
  const col2 = document.querySelector(".result-container");
  const col3 = document.querySelector(".output-graph");

  function startDrag(event, spacer) {
    isDragging = true;
    currentSpacer = spacer;
    startX = event.clientX;
    startWidthCol1 = col1.offsetWidth;
    startWidthCol2 = col2.offsetWidth;
    startWidthCol3 = col3.offsetWidth;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  }

  function onDrag(event) {
    if (!isDragging || !currentSpacer) return;

    const deltaX = event.clientX - startX;

    if (currentSpacer === spacer1) {
      const newWidthCol1 = startWidthCol1 + deltaX;
      const newWidthCol2 = startWidthCol2 - deltaX;

      if (newWidthCol1 < MIN_WIDTH1 || newWidthCol2 < MIN_WIDTH2) return;

      col1.style.flexBasis = `${newWidthCol1}px`;
      col2.style.flexBasis = `${newWidthCol2}px`;
    } else if (currentSpacer === spacer2) {
      const newWidthCol2 = startWidthCol2 + deltaX;
      const newWidthCol3 = startWidthCol3 - deltaX;

      if (newWidthCol2 < MIN_WIDTH2 || newWidthCol3 < MIN_WIDTH1) return;

      col2.style.flexBasis = `${newWidthCol2}px`;
      col3.style.flexBasis = `${newWidthCol3}px`;
    }
  }

  function stopDrag() {
    isDragging = false;
    currentSpacer = null;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  spacer1.addEventListener("mousedown", (e) => startDrag(e, spacer1));
  spacer2.addEventListener("mousedown", (e) => startDrag(e, spacer2));
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
// 14. Miscellaneous Code
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
});


function setUpApp() {
  setupKeydownListener();
  setupDOMContentLoadedListener();
  setupLoginButtonListener();
  setupSaveButtonListener();
  setupButtonFunctionalityListeners();
  setupColumnResizing();
  setupDraggableBlocks();
  setupClearHighlightsOnClickListener();
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
