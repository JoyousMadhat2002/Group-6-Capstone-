import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";

import { blockCategory } from "./scripts/blockConfiguration.js";
import { getBlockProperties } from "./scripts/blockProperties.js";
import { 
  createCategoryButtons, 
  newBlock,
  clearDropHighlights
} from "./scripts/blockCreation.js";

// Import Firebase modules correctly
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
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


  let blockChildElements;
  // section for top half

  // section for bottom half
  if (pc == "box-container") {
    blockChildElements = parentContainer.children; // Get all children/blocks from the box-container
  }
  else {
    blockChildElements = parentContainer.querySelector('.child-box-container').children; // Get all children/blocks from the box-container
  }
  for (let i = 0; i < blockChildElements.length; i++) {
    let childID = blockChildElements[i].dataset.blockID;

    for (let j = 0; j < Number(blockChildElements[i].dataset.blockDepth); j++) {
      pythontext.value += "    "; // Add spaces for indentation
    }

    if (childID == "for" || childID == "if" || childID == "while") {

      pythontext.value += `${childID}\n`;
      let cbc = blockChildElements[i].querySelector('.child-box-container');
      if (cbc.children.length > 0) {
        blockToText(blockChildElements[i].id);
      }


    }

    //logic for adding continue and break to text block
    else if (childID == "continue" || childID == "break") {
      pythontext.value += `${childID}\n`;
    }

    else {
      pythontext.value += `${childID}\n`;
    }
  }
}

// Function to convert text programming to block programming
function textToBlock(container) {
  let text = pythontext.value;
  if (container == "box-container") {
    document.getElementById(container).innerHTML = ""; // Clear block container
  }

  let lines = text.split("\n"); // Separate lines for parsing
  let depthBuilder = ["box-container"]; // counting preceeding zeros for depth
  let currDepth = 0;
  let linecount = 0;
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      console.log("line[j]]: " + `${j}`);
      if (lines[i][j] == " ") {
        linecount++;
      }
      else {
        break;
      }
    }


    // setting currDepth based on number of indentations

    if (linecount < 1) {

      currDepth = 1;
      console.log("currDepth: " + `${currDepth}`);
      console.log("linecount: " + `${linecount}`);
      console.log("linecount < 1");
    }
    else {
      currDepth = (linecount / 4) + 1;
      console.log("currDepth: " + `${currDepth}`);
      console.log("linecount: " + `${linecount}`);
      console.log("linecount > 1");
    }


    let tokens = lines[i].trim().split(" "); // trimming spaces from front and back of string, then splitting into tokens

    // logic to build blocks
    if (tokens != "") {
      if (tokens[0] == "if" || tokens[0] == "while" || tokens[0] == "for") {
        console.log(`${tokens[0]}` + " statement");
        let nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock

        // update depth
        if (true) {

        }

        // checking for comparison block operators
        if (tokens[2] == "==" || tokens[2] == "!=" || tokens[2] == ">=" || tokens[2] == "<=" || tokens[2] == "<" || tokens[2] == ">") {
          let nbComp = newBlock("comparisonBlock");
          let compElems = document.getElementById(nbComp).querySelectorAll(".childBox-Container-Horizontal");
          for (let k = 0; k < 3; k++) {
            if (compElems[k].querySelector(".math-comparison-input")) {
              compElems[k].querySelector(".math-comparison-input").value = tokens[k + 1];
            }
            compElems[k].dataset.blockValue = tokens[k + 1];
          }

          let nbHz = nbRef.querySelector(" .child-box-container-horizontal");
          nbHz.appendChild(document.getElementById(nbComp));
        }
        else if (tokens[2] == "+") {
          let x = 0;
        }


      }


    }
    linecount = 0;

  }

}

function toggleView() {
  var x = document.getElementById("python-code-result");
  var y = document.getElementById("block-container"); // Changed to block-container
  var toggleButton = document.getElementById("toggleButton");

  if (x.classList.contains("hidden")) {
    x.classList.remove("hidden");
    y.classList.add("hidden");
    toggleButton.textContent = "Block";
    isPythonView = true; // Switch to Python view
  } else {
    x.classList.add("hidden");
    y.classList.remove("hidden");
    toggleButton.textContent = "Python";
    isPythonView = false; // Switch to Block view
  }
}

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
      closeLoginDialog(); // Close the login dialog
      updateUIAfterLogin(userCredential.user); // Update the UI
  })
  .catch((error) => {
      console.error("Login Error:", error.message);
      errorMsg.textContent = error.message;
      errorMsg.classList.remove("hidden");
  });
}

// Function to open the login dialog
function openLoginDialog() {
  if (!document.getElementById("login-dialog")) {
      createLoginDialog();
  }
}

// Function to create the login dialog
function createLoginDialog() {
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

          <div class="dialog-buttons">
              <button id="login-submit">Log In</button>
              <button id="login-cancel">Cancel</button>
          </div>
      </div>
  `;

  document.body.appendChild(loginDialog);

  // Add event listeners
  document.getElementById("login-submit").addEventListener("click", attemptLogin);
  document.getElementById("login-cancel").addEventListener("click", closeLoginDialog);
  loginDialog.addEventListener("click", function (event) {
      if (event.target === loginDialog) {
          closeLoginDialog();
      }
  });
}

// Function to close the login dialog
function closeLoginDialog() {
  const loginDialog = document.getElementById("login-dialog");
  if (loginDialog) {
      loginDialog.remove();
  }
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
      })
      .catch((error) => {
          console.error("Logout Error:", error.message);
      });
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
