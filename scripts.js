/* 
newBlock(s, id) takes the name string from the button and creates a new element.
The new element is added to the "container" in the Result-Container section.
*/


let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;

const boxes = document.querySelectorAll(".box");
boxes.forEach(box => {
    box.addEventListener("dragstart", dragStart);
    box.addEventListener("dragover", dragOver);
    box.addEventListener("drop", drop);
});

const pythonTextarea = document.getElementById("pythontext"); // creating const for element to pull from
ptext = pythonTextarea.value; // initializing variable.

// test function for storing textarea input as variable
function StoreBlob() {
    ptext = pythonTextarea.value;

    ptext = ptext.toString();
}

// test function for sending stored state to blob to read into textarea
function PullBlob() {
    const blob = new Blob([ptext], { type: 'text/plain' })
    blob.text().then(text => {

        pythonTextarea.value = text; // sends contents of blob to textarea
    });
    // t.value = ptext; // less useful way to store information
}


const blockContainer = document.getElementById("box-container"); // Gets box container, could use as global variable?


function blockToText() {
    pythontext.value = ""; // Clear text area
    let blockChildElements = blockContainer.children; // Assigns all children/blocks from box-container

    for (let i = 0; i < blockChildElements.length; i++) { // Loop through children/blocks to print to text area
        for (let j = 0; j < Number(blockChildElements[i].dataset.blockDepth); j++) {
            pythontext.value += "    ";
        }

        pythontext.value += blockChildElements[i].dataset.blockType;
        pythontext.value += " ";
        pythontext.value += blockChildElements[i].dataset.blockXValue;
        pythontext.value += " ";
        pythontext.value += blockChildElements[i].dataset.blockOperator;
        pythontext.value += " ";
        pythontext.value += blockChildElements[i].dataset.blockYValue;
        pythontext.value += "\n";
        console.log(blockChildElements[i]);

    }

}

// Function to convert text programming to block programming
function textToBlock() {
    let text = pythontext.value;

    let lines = text.split("\n"); // Separate lines for parsing
    // console.log(lines);

    document.getElementById("box-container").innerHTML = ''; // Clear block container

    let depthBuilder = ["box-container"]; //
    let currDepth = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i] != "") {
            lines[i] = lines[i].trim();
            // line = line.split(" ");

            let tokens = lines[i].split(" ");

            let a = tokens[0];
            let b = tokens[1];
            let c = tokens[2];
            let d = tokens[3];
            let builtBlock = newBlock(a, b, c, d);
        }
    }
}

function toggleView() {
    var x = document.getElementById("python-code-result");
    var y = document.getElementById("box-container");
    if (x.style.display === "block") {
        x.style.display = "none";
        y.style.display = "block"

    } else {
        x.style.display = "block";
        y.style.display = "none"
    }
}

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

// Event listener for button click
document.getElementById("run-code-btn").addEventListener("click", toggleRunButton);
// Event listener for CTRL + ENTER
document.addEventListener("keydown", function (event) {
    if (event
        .ctrlKey && event.key === "Enter") {
        toggleRunButton();
    }
});


// Placeholder functions for future implementation of running/stopping code; added for implementation of CTRL+ENTER
let isRunning = false; // tracks if the program is running

// placeholder function: start code
function runCode() {
    if (isRunning == true) {
        // if program currently running, and CTRL+ENTER hit again, stop code
        stopCode();
        return;
    }

    isRunning = true; // set flag for code running

    // REPLACE BELOW WITH FUTURE IMPLEMENTATION LATER
    console.log("test: code running");
}

// placeholder function: stop code
function stopCode() {
    isRunning = false; // reset flag

    // REPLACE BELOW WITH FUTURE IMPLEMENTATION LATER
    console.log("test: code stopped");
}
// Placeholder end

// login button functionality
const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", function () {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");

    if (username === "user" && password === "password") {
        localStorage.setItem("loggedIn", "true");
        alert("Login successful!");
    } else {
        alert("Invalid credentials");
    }
});

// save button functionality
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", function () {
    const pythonCode = document.getElementById("pythontext").value;
    localStorage.setItem("savedCode", pythonCode);
    alert("Code saved locally!");
});


// Define the toolbox JSON structure
const toolbox = {
    "kind": "categoryToolbox",
    "contents": [
        {
            "kind": "category",
            "name": "Logic",
            "colour": "210",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_if"
                },
                {
                    "kind": "block",
                    "type": "logic_compare",
                    "fields": "{'EQ', 'NEQ', 'LT', 'LTE', 'GT', 'GTE'}"
                },
                {
                    "kind": "block",
                    "type": "logic_operation",
                    "fields": "{'AND', 'OR'}"
                },
                {
                    "kind": "block",
                    "type": "logic_negate",
                },
                {
                    "kind": "block",
                    "type": "logic_boolean",
                },
                {
                    "kind": "block",
                    "type": "logic_null",
                },
                {
                    "kind": "block",
                    "type": "logic_ternary",
                }
            ]
        },
        {
            "kind": "category",
            "name": "Loops",
            "colour": "120",
            "contents": [
                {
                    "kind": "block",
                    "type": "controls_repeat_ext",
                },
                {
                    "kind": "block",
                    "type": "controls_whileUntil",
                },
                {
                    "kind": "block",
                    "type": "controls_for",
                },
                {
                    "kind": "block",
                    "type": "controls_forEach",
                },
                {
                    "kind": "block",
                    "type": "controls_flow_statements",
                }
            ]
        },
        {
            "kind": "category",
            "name": "Math",
            "colour": "230",
            "contents": [
                {
                    "kind": "block",
                    "type": "math_number",
                },
                {
                    "kind": "block",
                    "type": "math_arithmetic",
                },
                {
                    "kind": "block",
                    "type": "math_single",
                },
                {
                    "kind": "block",
                    "type": "math_trig",
                },
                {
                    "kind": "block",
                    "type": "math_constant",
                },
                {
                    "kind": "block",
                    "type": "math_number_property",
                },
                {
                    "kind": "block",
                    "type": "math_round",
                },
                {
                    "kind": "block",
                    "type": "math_on_list",
                },
                {
                    "kind": "block",
                    "type": "math_modulo",
                },
                {
                    "kind": "block",
                    "type": "math_constrain",
                },
                {
                    "kind": "block",
                    "type": "math_random_int",
                },
                {
                    "kind": "block",
                    "type": "math_random_float",
                }
            ]
        },
        {
            "kind": "category",
            "name": "Text",
            "colour": "160",
            "contents": [
                {
                    "kind": "block",
                    "type": "text",
                },
                {
                    "kind": "block",
                    "type": "text_join",
                },
                {
                    "kind": "block",
                    "type": "text_append",
                },
                {
                    "kind": "block",
                    "type": "text_length",
                },
                {
                    "kind": "block",
                    "type": "text_isEmpty",
                },
                {
                    "kind": "block",
                    "type": "text_indexOf",
                },
                {
                    "kind": "block",
                    "type": "text_charAt",
                },
                {
                    "kind": "block",
                    "type": "text_getSubstring",
                },
                {
                    "kind": "block",
                    "type": "text_changeCase",
                },
                {
                    "kind": "block",
                    "type": "text_trim",
                },
                {
                    "kind": "block",
                    "type": "text_print",
                },
                {
                    "kind": "block",
                    "type": "text_prompt_ext",
                }
            ]
        },
        {
            "kind": "category",
            "name": "Lists",
            "colour": "260",
            "contents": [
                {
                    "kind": "block",
                    "type": "lists_create_empty",
                },
                {
                    "kind": "block",
                    "type": "lists_create_with",
                },
                {
                    "kind": "block",
                    "type": "lists_repeat",
                },
                {
                    "kind": "block",
                    "type": "lists_length",
                },
                {
                    "kind": "block",
                    "type": "lists_isEmpty",
                },
                {
                    "kind": "block",
                    "type": "lists_indexOf",
                },
                {
                    "kind": "block",
                    "type": "lists_getIndex",
                },
                {
                    "kind": "block",
                    "type": "lists_setIndex",
                },
                {
                    "kind": "block",
                    "type": "lists_getSublist",
                },
                {
                    "kind": "block",
                    "type": "lists_split",
                },
                {
                    "kind": "block",
                    "type": "lists_sort",
                }
            ]
        },
        {
            "kind": "category",
            "name": "Variables",
            "colour": "330",
            "custom": "VARIABLE",
        },
        {
            "kind": "category",
            "name": "Functions",
            "colour": "290",
            "custom": "PROCEDURE",
        }
    ]
};

Blockly.inject('blocklyDiv', { toolbox });

function showCode() {
    const workspace = Blockly.getMainWorkspace();
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    document.getElementById('pythontext').value = code;
}