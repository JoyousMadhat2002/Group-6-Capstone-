/* 
newBlock(s, id) takes the name string from the button and creates a new element.
The new element is added to the "container" in the Result-Container section.
*/


let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;

const blockCategory = {
    "logic": {
        elements: [
            {
                name: "if",
                blockID: "if",
                description: "Conditional statement",
                type: "control",
                parentElement: "block",
                childElement: "block",
                sisterElement: ["elif", "else"]
            },
            {
                name: "while",
                blockID: "while",
                description: "While loop",
                type: "loop",
                parentElement: "block",
                childElement: "block",
                sisterElement: null
            },
            {
                name: "for",
                blockID: "for",
                description: "For loop",
                type: "loop",
                parentElement: "block",
                childElement: "block",
                sisterElement: null
            },
            {
                name: "break",
                blockID: "break",
                description: "Break loop",
                type: "loop",
                parentElement: "block",
                childElement: null,
                sisterElement: null
            },
            {
                name: "continue",
                blockID: "continue",
                description: "Continue loop",
                type: "loop",
                parentElement: "block",
                childElement: null,
                sisterElement: null
            }
        ]
    },
    "math": {
        elements: [
            {
                name: "+",
                blockID: "add",
                description: "Addition",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["number1", "number2"],
                sisterElement: null
            },
            {
                name: "-",
                blockID: "sub",
                description: "Subtraction",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["number1", "number2"],
                sisterElement: null
            },
            {
                name: "*",
                blockID: "mul",
                description: "Multiplication",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["number1", "number2"],
                sisterElement: null
            },
            {
                name: "/",
                blockID: "div",
                description: "Division",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["number1", "number2"],
                sisterElement: null
            },
            {
                name: "%",
                blockID: "mod",
                description: "Modulo",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["number1", "number2"],
                sisterElement: null
            },
            {
                name: "**",
                blockID: "exp",
                description: "Exponentiation",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["base", "exponent"],
                sisterElement: null
            },
            {
                name: "//",
                blockID: "floorDiv",
                description: "Floor division",
                type: "arithmetic",
                parentElement: "block",
                childElement: ["number1", "number2"],
                sisterElement: null
            }
        ]
    },
    "comparison": {
        elements: [
            {
                name: "==",
                blockID: "eq",
                description: "Equality comparison",
                type: "comparison",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: "!=",
                blockID: "neq",
                description: "Inequality comparison",
                type: "comparison",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: ">",
                blockID: "gt",
                description: "Greater than comparison",
                type: "comparison",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: "<",
                blockID: "lt",
                description: "Less than comparison",
                type: "comparison",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: ">=",
                blockID: "gte",
                description: "Greater than or equal to comparison",
                type: "comparison",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: "<=",
                blockID: "lte",
                description: "Less than or equal to comparison",
                type: "comparison",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            }
        ]
    },
    "boolean": {
        elements: [
            {
                name: "and",
                blockID: "and",
                description: "Logical AND",
                type: "logical",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: "or",
                blockID: "or",
                description: "Logical OR",
                type: "logical",
                parentElement: "block",
                childElement: ["operand1", "operand2"],
                sisterElement: null
            },
            {
                name: "not",
                blockID: "not",
                description: "Logical NOT",
                type: "logical",
                parentElement: "block",
                childElement: ["operand"],
                sisterElement: null
            }
        ]
    },
    "functions": {
        elements: [
            {
                name: "def",
                blockID: "def",
                description: "Define a function",
                type: "function",
                parentElement: "block",
                childElement: ["function_name", "arguments"],
                sisterElement: null
            },
            {
                name: "return",
                blockID: "return",
                description: "Return from a function",
                type: "function",
                parentElement: "block",
                childElement: ["expression"],
                sisterElement: null
            },
            {
                name: "print",
                blockID: "print",
                description: "Print to the console",
                type: "function",
                parentElement: "block",
                childElement: ["expression"],
                sisterElement: null
            }
        ]
    },
    "variables": {
        elements: [
            {
                name: "=",
                blockID: "assign",
                description: "Assignment",
                type: "assignment",
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            },
            {
                name: "+=",
                blockID: "addAssign",
                description: "Increment assignment",
                type: "assignment",
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            },
            {
                name: "-=",
                blockID: "subAssign",
                description: "Decrement assignment",
                type: "assignment",
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            },
            {
                name: "*=",
                blockID: "mulAssign",
                description: "Multiplication assignment",
                type: "assignment",
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            },
            {
                name: "/=",
                blockID: "divAssign",
                description: "Division assignment",
                type: "assignment",
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            },
            {
                name: "%=",
                blockID: "modAssign",
                description: "Modulo assignment",
                type: "assignment",
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            }
        ]
    }
};
/*
<div class="category" onclick="toggleCategory('logic')">
    <h4>Logic</h4>
    <div id="logic" class="category-blocks hidden">
        <button id="createBoxButton" onclick="newBlock(name, '5', '<', '6')" name="if" blockID="if" type="control"  >
            If Block
        </button>
    </div>
</div>
*/
function createCategory() {
    const catagoryContainer = document.getElementById("categories");

    for (const catagory in blockCategory) {
        const catagoryElement = document.createElement("div");
        catagoryElement.classList.add("category");
        catagoryElement.onclick = () => toggleCategory(catagory);

        const catagoryTitle = document.createElement("h4");
        catagoryTitle.textContent = catagory.charAt(0).toUpperCase() + catagory.slice(1);
        catagoryElement.appendChild(catagoryTitle);

        const catagoryBlocks = document.createElement("div");
        catagoryBlocks.id = catagory;
        catagoryBlocks.classList.add("category-blocks");
        catagoryBlocks.classList.add("hidden");

        for (const block of blockCategory[catagory].elements) {
            const blockButton = document.createElement("button");
            blockButton.name = block.name;
            blockButton.textContent = block.name.charAt(0).toUpperCase() + block.name.slice(1);
            blockButton.onclick = () => newBlock(block.name, '5', '<', '6');
            catagoryBlocks.appendChild(blockButton);
        }

        catagoryElement.appendChild(catagoryBlocks);
        catagoryContainer.appendChild(catagoryElement);
    }


}

createCategory();


function newBlock(s, x, o, y) {
    const container = document.getElementById("box-container");
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    newBlock.id = "box_" + ++blockCounter;

    newBlock.dataset.blockType = s;        // Set block type
    newBlock.dataset.blockXValue = "4";     // Set block left value
    newBlock.dataset.blockYValue = "5";    // Set block right value
    newBlock.dataset.blockOperator = "<";  // Set block operator/comparator

    newBlock.dataset.blockType = s; // Set block type
    newBlock.dataset.blockXValue = x; // Set block left operand
    newBlock.dataset.blockOperator = o; // Set block operator
    newBlock.dataset.blockYValue = y; // Set block right operand

    // Set block "depth". Future-proofed for when container is dynamic, will need an update function when block is moved
    newBlock.dataset.blockDepth = Number(container.getAttribute("data-blockDepth")) + 1;

    const svgImage = document.createElement("img");
    svgImage.width = 24;
    svgImage.height = 24;



    newBlock.textContent = "Type: " + newBlock.dataset.blockType;
    newBlock.textContent += "\n" + newBlock.dataset.blockXValue + newBlock.dataset.blockOperator + newBlock.dataset.blockYValue;
    newBlock.textContent += " Depth: " + newBlock.dataset.blockDepth;

    newBlock.style.backgroundColor = 'purple';

    // Append the new block to the container
    container.appendChild(newBlock);

    // Add event listeners
    newBlock.draggable = true;
    newBlock.addEventListener("dragstart", dragStart);
    newBlock.addEventListener("dragover", dragOver);
    newBlock.addEventListener("drop", drop);
    newBlock.addEventListener("click", selectBlock);

    // Get depth from container, increase by 1. Change to parent container in future!
    newBlock.blockDepth = 0;

}

function dragStart(event) {
    // Ensure the dragged element is the box container itself, not just the SVG img
    dragged = event.target.closest(".box");

    if (dragged) {
        event.dataTransfer.effectAllowed = 'move';
    }
}

function dragOver(event) {
    event.preventDefault();
    const targetBlock = event.target.closest(".box");
    if (targetBlock) {
        targetBlock.classList.add('drop-target');
    }
}

function drop(event) {
    event.preventDefault();

    if (dragged) {
        const targetBlock = event.target.closest(".box");
        if (targetBlock) {
            targetBlock.classList.remove('drop-target');
            targetBlock.parentNode.insertBefore(dragged, targetBlock);
        } else if (event.target.id === "box-container") {
            event.target.appendChild(dragged);
        }

        dragged = null;
    }
}

// Function for switching beween block catagories when clicked
function toggleCategory(categoryId) {
    // Hide all category blocks
    const allCategories = document.querySelectorAll('.category-blocks');
    allCategories.forEach(category => {
        if (category.id === categoryId) {
            // Toggle visibility of the clicked category
            category.classList.toggle('hidden');
        } else {
            // Hide all other catagories
            category.classList.add('hidden');
        }
    });
}
// Prevent click event from closing catagory (you can comment out to see the effect)
document.querySelectorAll('.category-blocks button').forEach(button => {
    button.addEventListener('click', event => {
        event.stopPropagation();
    });
});

// Function to delete a block by dragging to code-container (left side)
const codeContainer = document.querySelector(".code-container");

codeContainer.addEventListener("dragover", function (event) {
    event.preventDefault(); // Allow dropping
});
codeContainer.addEventListener("drop", function (event) {
    event.preventDefault();
    if (dragged) {
        dragged.remove(); // Delete the dragged block
        dragged = null; // Reset the dragged element
    }
});
document.addEventListener('dragleave', function (event) {
    const targetBlock = event.target.closest(".box");
    if (targetBlock) {
        targetBlock.classList.remove('drop-target');
    }
});

// Function to select a block and add highlight
function selectBlock(event) {
    // Check if the clicked element is an image inside a block
    const targetBlock = event.target.closest(".box");

    if (!targetBlock) return; // If no block is found, exit

    // Clear previous selection if a block is already highlighted
    if (highlightedBlock) {
        highlightedBlock.classList.remove("selected");
    }

    // Mark clicked block as highlighted
    highlightedBlock = targetBlock;
    highlightedBlock.classList.add("selected");

    // Prevent click event from being repeated multiple times
    event.stopPropagation();
}

// Event listener to deselect block when clicking outside
document.addEventListener("click", function (event) {
    if (highlightedBlock && !highlightedBlock.contains(event.target)) {
        // Remove highlight and deselect the block
        highlightedBlock.classList.remove("selected");
        highlightedBlock = null;
    }
});

// Event listener to delete block when block is highlighted and "Delete" key is pressed
document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && highlightedBlock) {
        highlightedBlock.remove(); // Delete highlighted block
        highlightedBlock = null; // Reset highlighted block
    }
});

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


// Dropdown menu functionality for the block
const dropdownMenu = document.createElement('div');
dropdownMenu.id = 'dropdown-menu';

const operators = ['Select', '+', '-', '/', '*', '%', '**', '//'];

operators.forEach(operator => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = operator;
    item.onclick = () => selectOperator(operator);
    dropdownMenu.appendChild(item);
});

document.body.appendChild(dropdownMenu);

// Function to insert SVG into the container
//The text element causes problems so it is commented out

function insertSVG() {
    const svgContainer = document.getElementById('svg-container');
    svgContainer.innerHTML = `
        <div id="svg-block" class="box" draggable="true" ondragstart="dragStart(event)">
            <svg version="1.1" viewBox="0 0 7 3" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="linearGradient185" x1="-.039579" x2="1.9294" y1="1.9764" y2="1.9764"
                    gradientTransform="translate(.0013967 -.010816)" gradientUnits="userSpaceOnUse">
                    <stop offset="0" />
                    </linearGradient>
                    <linearGradient id="linearGradient4" x1=".505" x2="2.025" y1="1.5" y2="1.5" 
                        gradientUnits="userSpaceOnUse">
                        <stop offset="0" />
                    </linearGradient>
                </defs>
                <g id="operator">
                    <g id="arithmetic" transform="matrix(1 0 0 1.0281 2.5029 1)">
                        <path id="arithmetic-block"
                            d="m0.26711 0c-0.14 0-0.25 0.11-0.25 0.25v0.5c0 0.14 0.10997 0.22267 0.24997 0.22267h1.46c0.14 0 0.25003-0.08267 0.25003-0.22267v-0.5c0-0.14-0.11-0.25-0.25-0.25z"
                            fill="#80cbc4" opacity=".83" stroke-width="0" style="paint-order:fill markers stroke" />
                        <g id="select-bar-container" transform="matrix(1.0001 0 0 .95918 .0511 -1.3853)" stroke-linecap="round"
                            stroke-linejoin="round" onclick="toggleDropdown(event)">
                            <rect id="select-bar" x="-.033183" y="1.7156" width="1.9588" height=".5" rx=".24995" ry=".23826"
                                fill-opacity=".24335" opacity=".83" stroke="url(#linearGradient185)" stroke-width=".01007"
                                style="paint-order:fill markers stroke" />
                            <text id="select-txt" x="0.98000002" y="1.9656" alignment-baseline="middle" fill="#000000"
                                font-family="sans-serif" font-size="2.05%" stroke="url(#linearGradient7)" stroke-width="0"
                                text-anchor="middle"
                                style="font-variant-caps:normal;font-variant-east-asian:normal;font-variant-ligatures:normal;font-variant-numeric:normal;paint-order:fill markers stroke"
                                itemid="select-text">Select</text>
                        </g>
                    </g>
                    <g id="operator" stroke-width=".094488">
                        <g id="left-group" stroke-width=".094488">
                            <path id="left-block"
                                d="m0.755 0.5c-0.14 0-0.25 0.11-0.25 0.25v1.5c0 0.14 0.11 0.25 0.25 0.25h1.02c0.14 0 0.25-0.11 0.25-0.25v-1.5c0-0.14-0.11-0.25-0.25-0.25z"
                                fill="none" stroke="url(#linearGradient4)" />

                            <!--<text transform="translate(-.0055243 .13258)" fill="#000000" font-family="sans-serif" font-size="1.5337px" -->
                            <!--    style="shape-inside:url(#rect6);shape-padding:0;white-space:pre" xml:space="preserve">  -->
                            <!--    <tspan x="0.75585938" y="1.8992684">E</tspan>  -->
                            <!--</text> -->
                        </g>

                        <g id="right-group" stroke-width=".094488">
                            <path id="right-block"
                                d="m5.23 0.5c-0.14 0-0.25 0.11-0.25 0.25v1.5c0 0.14 0.11 0.25 0.25 0.25h1.02c0.14 0 0.25-0.11 0.25-0.25v-1.5c0-0.14-0.11-0.25-0.25-0.25z"
                                fill="none" stroke="url(#linearGradient4)"/>
                        <!--    <text transform="translate(4.4691 .1823)" fill="#000000" font-family="sans-serif" font-size="1.5337px" -->
                        <!--        style="shape-inside:url(#rect6);shape-padding:0;white-space:pre" xml:space="preserve">  -->
                        <!--        <tspan x="0.75585938" y="1.8992684">E</tspan>   -->
                        <!--    </text> -->
                        </g>

                        <path id="operator-block"
                            d="m0.25 0c-0.14 0-0.25 0.11-0.25 0.25v2.49c0 0.14 0.12 0.26 0.26 0.26h6.49c0.14 0 0.25-0.11 0.25-0.25v-2.5c0-0.14-0.11-0.25-0.25-0.25zm0.51 0.5h1.01c0.14 0 0.25 0.11 0.25 0.25v1.5c0 0.14-0.11 0.25-0.25 0.25h-1.01c-0.14 0-0.25-0.11-0.25-0.25v-1.5c0-0.14 0.11-0.25 0.25-0.25zm4.47 0h1.02c0.14 0 0.25 0.11 0.25 0.25v1.5c0 0.14-0.11 0.25-0.25 0.25h-1.02c-0.14 0-0.25-0.11-0.25-0.25v-1.5c0-0.14 0.11-0.25 0.25-0.25zm-2.46 0.5h1.46c0.14 0 0.25 0.11 0.25 0.25v0.5c0 0.14-0.11 0.25-0.25 0.25h-1.46c-0.14 0-0.25-0.11-0.25-0.25v-0.5c0-0.14 0.11-0.25 0.25-0.25z"
                            fill="#c6e1a6" />
                    </g>    
                </g>
            </svg>
        </div>
      `;
}

function toggleDropdown(event) {
    const rect = document.getElementById('select-bar').getBoundingClientRect();
    dropdownMenu.style.left = `${rect.left}px`;
    dropdownMenu.style.top = `${rect.bottom}px`;
    dropdownMenu.style.width = `${rect.width}px`;
    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
}

function selectOperator(operator) {
    const selectText = document.getElementById('select-txt');
    selectText.textContent = operator;

    if (operator === '+') selectText.setAttribute('itemid', "ADD");
    else if (operator === '-') selectText.setAttribute('itemid', "SUB");
    else if (operator === '/') selectText.setAttribute('itemid', "DIV");
    else if (operator === '*') selectText.setAttribute('itemid', "MUL");
    else if (operator === '%') selectText.setAttribute('itemid', "MOD");
    else if (operator === '**') selectText.setAttribute('itemid', "EXP");
    else if (operator === '//') selectText.setAttribute('itemid', "FLRDIV");
    else selectText.setAttribute('itemid', "select-text");

    dropdownMenu.style.display = 'none';
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('#select-bar-container') && !event.target.closest('#dropdown-menu')) {
        dropdownMenu.style.display = 'none';
    }
});

//Code to resize the columns
document.addEventListener('DOMContentLoaded', () => {
    let isDragging = false;
    let currentSpacer = null;
    let startX = 0;
    let startWidthCol1 = 0;
    let startWidthCol2 = 0;
    let startWidthCol3 = 0;

    const MIN_WIDTH1 = 100;
    const MIN_WIDTH2 = 200;

    const spacer1 = document.querySelector('.handle1');
    const spacer2 = document.querySelector('.handle2');
    const col1 = document.querySelector('.code-container');
    const col2 = document.querySelector('.result-container');
    const col3 = document.querySelector('.output-graph');

    function startDrag(event, spacer) {
        isDragging = true;
        currentSpacer = spacer;
        startX = event.clientX;
        startWidthCol1 = col1.offsetWidth;
        startWidthCol2 = col2.offsetWidth;
        startWidthCol3 = col3.offsetWidth;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    //Does the calculations for the resizing
    function onDrag(event) {
        if (!isDragging || !currentSpacer) return;

        const deltaX = event.clientX - startX;

        if (currentSpacer === spacer1) {
            const newWidthCol1 = startWidthCol1 + deltaX;
            const newWidthCol2 = startWidthCol2 - deltaX;

            if (newWidthCol1 < MIN_WIDTH1 || newWidthCol2 < MIN_WIDTH2) return;

            col1.style.flexBasis = `${startWidthCol1 + deltaX}px`;
            col2.style.flexBasis = `${startWidthCol2 - deltaX}px`;
        } else if (currentSpacer === spacer2) {
            const newWidthCol2 = startWidthCol2 + deltaX;
            const newWidthCol3 = startWidthCol3 - deltaX;

            if (newWidthCol2 < MIN_WIDTH2 || newWidthCol3 < MIN_WIDTH1) return;

            col2.style.flexBasis = `${startWidthCol2 + deltaX}px`;
            col3.style.flexBasis = `${startWidthCol3 - deltaX}px`;
        }
    }

    function stopDrag() {
        isDragging = false;
        currentSpacer = null;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    spacer1.addEventListener('mousedown', (e) => startDrag(e, spacer1));
    spacer2.addEventListener('mousedown', (e) => startDrag(e, spacer2));

});