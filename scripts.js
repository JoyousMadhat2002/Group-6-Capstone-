/* 
newBlock(s, id) takes the name string from the button and creates a new element.
The new element is added to the "container" in the Result-Container section.
*/


let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;
let isPythonView = false;

// Define a color scheme for the categories
const categoryColors = {
    logic: "#5a80a5",      // Steel Blue
    math: "#5ba55a",       // Medium Sea Green
    comparison: "#ffcc99", // Peach
    boolean: "#80cbc4",    // Aqua Marine
    functions: "#995ba6",  // Amethyst Purple
    variables: "#a55b80"   // Rosewood
};

const blockCategory = {
    "logic": {
        elements: [
            {
                name: "if",
                blockID: "if",
                description: "Conditional statement",
                type: "control",
                blockType: ["control"],
                parentElement: "block",
                childElement: "block",
                sisterElement: ["elif", "else"]
            },
            {
                name: "while",
                blockID: "while",
                description: "While loop",
                type: "loop",
                blockType: ["loop"],
                parentElement: "block",
                childElement: "block",
                sisterElement: null
            },
            {
                name: "for",
                blockID: "for",
                description: "For loop",
                type: "loop",
                blockType: ["loop"],
                parentElement: "block",
                childElement: "block",
                sisterElement: null
            },
            {
                name: "break",
                blockID: "break",
                description: "Break loop",
                type: "loop",
                blockType: ["loop"],
                parentElement: "block",
                childElement: null,
                sisterElement: null
            },
            {
                name: "continue",
                blockID: "continue",
                description: "Continue loop",
                type: "loop",
                blockType: ["loop"],
                parentElement: "block",
                childElement: null,
                sisterElement: null
            }
        ]
    },
    "math": {
        elements: [
            {
                name: "Arithmetic Operations",
                blockID: "arithmeticOps",
                description: "Arithmetic operators (+, -, *, /, %, **, //)",
                type: "arithmetic",
                blockType: ["---", "+", "-", "*", "/", "%", "**", "//"],
                parentElement: "block",
                childElement: ["operator", "operand1", "operand2"],
                sisterElement: null
            }
        ]
    },
    "comparison": {
        elements: [
            {
                name: "Comparison Operators",
                blockID: "comparisonOps",
                description: "Comparison operators (==, !=, >, <, >=, <=)",
                type: "comparison",
                blockType: ["---", "==", "!=", ">", "<", ">=", "<="],
                parentElement: "block",
                childElement: ["operator", "operand1", "operand2"],
                sisterElement: null
            }
        ]
    },
    "boolean": {
        elements: [
            {
                name: "Logical Operations",
                blockID: "logicalOps",
                description: "Logical operators (and, or, not)",
                type: "logical",
                blockType: ["---", "and", "or", "not"],
                parentElement: "block",
                childElement: ["operator", "operand1", "operand2"],
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
                blockType: ["function"],
                parentElement: "block",
                childElement: ["function_name", "arguments"],
                sisterElement: null
            },
            {
                name: "return",
                blockID: "return",
                description: "Return from a function",
                type: "function",
                blockType: ["function"],
                parentElement: "block",
                childElement: ["expression"],
                sisterElement: null
            },
            {
                name: "print",
                blockID: "print",
                description: "Print to the console",
                type: "function",
                blockType: ["function"],
                parentElement: "block",
                childElement: ["expression"],
                sisterElement: null
            }
        ]
    },
    "variables": {
        elements: [
            {
                name: "Variable Declaration",
                blockID: "varDeclOps",
                description: "Declare a variable",
                type: "variable",
                blockType: ["variable"],
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            },
            {
                name: "Variable Assignment",
                blockID: "varAssignOps",
                description: "Assignment operators (=, +=, -=, *=, /=, %=)",
                type: "assignment",
                blockType: ["---", "=", "+=", "-=", "*=", "/=", "%="],
                parentElement: "block",
                childElement: ["variable", "value"],
                sisterElement: null
            }
        ]
    }
};

// Function to dynamically create buttons and assign background colors to categories
function createCategoryButtons(blockCategory) {
    for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);

        // Check if the category container exists
        if (!categoryContainer) {
            console.warn(`No container found for category: ${categoryName}`);
            continue;
        }

        // Apply the background color to the category header
        const categoryHeader = categoryContainer.parentElement.querySelector(".category-header");
        const color = categoryColors[categoryName] || "#cccccc";
        categoryHeader.style.backgroundColor = color;

        // Iterate through each element in the category
        categoryData.elements.forEach(element => {
            const button = document.createElement("button");
            button.id = `${element.blockID}Button`;
            button.name = element.name;
            button.innerText = `${element.name}`;

            // Apply category color to the button
            button.style.backgroundColor = color;

            // Add the description to the button's title attribute
            button.title = element.description; // Tooltip text showing description

            // Add an onclick handler to call newBlock
            button.onclick = function () {
                // Call the newBlock function with the appropriate parameters
                newBlock(element.blockID);
            };

            // Append the button to the category container
            categoryContainer.appendChild(button);
        });
    }
}

// Call the function to create the buttons
createCategoryButtons(blockCategory);

function newBlock(s, x, o, y) {
    if (isPythonView) {
        console.warn("Cannot create a new block in Python view.");
        return; // Exit the function early
    }
    
    const container = document.getElementById("box-container");
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    newBlock.id = "box_" + ++blockCounter; // Increment block counter and set ID
    newBlock.dataset.blockID = s; // Store the blockID in the dataset

    newBlock.dataset.blockXValue = x;
    newBlock.dataset.blockYValue = y;
    newBlock.dataset.blockOperator = o;

    // Calculate and set the depth
    const parentDepth = Number(container.getAttribute("data-blockDepth")) || 0;
    newBlock.dataset.blockDepth = parentDepth + 1; // Parent depth + 1 for the new block

    // Set block color and retrieve block types and child elements
    let blockCategoryColor = "#cccccc"; // Default block color
    let blockTypes = []; // Array to hold block types for dropdown
    let childElement = null; // Variable to check for childElement support

    for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
        categoryData.elements.forEach(element => {
            if (element.blockID === s) {
                blockCategoryColor = categoryColors[categoryName] || blockCategoryColor;
                blockTypes = element.blockType; // Retrieve the blockType array
                childElement = element.childElement; // Retrieve child element configuration
            }
        });
    }

    newBlock.style.backgroundColor = blockCategoryColor; // Apply the category color

    // Create a label to display the blockID
    const blockIDLabel = document.createElement("span");
    blockIDLabel.classList.add("block-id-label");
    blockIDLabel.textContent = `ID: ${s}`;
    newBlock.appendChild(blockIDLabel);

    // Add dropdown menu if blockType has multiple elements
    if (blockTypes.length > 1) {
        const dropdown = document.createElement("select");
        dropdown.classList.add("block-dropdown");

        // Populate dropdown with block types and set the first item as the default
        blockTypes.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type; // Dropdown option text
            dropdown.appendChild(option);
        });

        // Set the default value to the first element in blockTypes
        dropdown.value = blockTypes[0];

        // Function to adjust the width of the dropdown based on selected option
        function adjustDropdownWidth() {
            const selectedOption = dropdown.options[dropdown.selectedIndex];
            const textWidth = getTextWidth(selectedOption.textContent, dropdown);
            dropdown.style.width = `${textWidth + 40}px`;
        }

        // Helper function to calculate the width of the option text
        function getTextWidth(text, dropdownElement) {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            context.font = window.getComputedStyle(dropdownElement).font;
            return context.measureText(text).width;
        }

        // Adjust dropdown width when page loads and when selection changes
        adjustDropdownWidth();
        dropdown.addEventListener("change", adjustDropdownWidth);

        // Update blockID when the user selects a different option from the dropdown
        dropdown.addEventListener("change", function () {
            newBlock.dataset.blockID = dropdown.value;
        });

        // Add the dropdown to the block
        newBlock.appendChild(dropdown);
    } else {
        // Display the block type as plain text if no dropdown needed
        const blockTypeLabel = document.createElement("span");
        blockTypeLabel.textContent = `Type: ${blockTypes[0]}`;
        newBlock.appendChild(blockTypeLabel);
    }

    // Add depth information
    const depthInfo = document.createElement("span");
    depthInfo.classList.add("block-depth-info");
    depthInfo.textContent = ` Depth: ${newBlock.dataset.blockDepth}`;
    newBlock.appendChild(depthInfo);

    // Add childBox if childElement supports "block"
    if (childElement === "block") {
        const childBox = document.createElement("div");
        childBox.classList.add("child-box-container");

        // Set childBox attributes: parent ID, block ID, and depth
        childBox.dataset.parentID = newBlock.id;
        childBox.dataset.parentBlockID = s;
        childBox.dataset.blockDepth = parseInt(newBlock.dataset.blockDepth) + 1;

        // Add a placeholder text for clarity
        newBlock.appendChild(childBox);
    }

    container.appendChild(newBlock); // Add the new block to the container

    // Make the block draggable and add event listeners for drag and select actions
    newBlock.draggable = true;
    newBlock.addEventListener("dragstart", dragStart);
    newBlock.addEventListener("dragover", dragOver);
    newBlock.addEventListener("drop", drop);
    newBlock.addEventListener("click", selectBlock);

    // Update the line numbers whenever a new block is added
    updateLineNumbers();
}


// Function to remove a block by its ID
function removeBlock(blockId) {
    const block = document.getElementById(blockId);
    if (block) {
        block.remove(); // Remove the block from the DOM
        updateLineNumbers(); // Update line numbers after removal
    }
}

// Function to update the line numbers based on the number of blocks
function updateLineNumbers() {
    const codeLinesContainer = document.querySelector(".code-lines");
    const blocks = document.querySelectorAll("#box-container .box");

    // Clear existing line numbers
    codeLinesContainer.innerHTML = '';

    // Create new line numbers based on the number of blocks
    const totalLines = blocks.length + 1; // +1 for the extra empty line at the bottom
    for (let i = 1; i <= totalLines; i++) {
        const lineNumber = document.createElement("div");
        lineNumber.classList.add("code-line");
        if (i === totalLines) {
            // This is the extra empty line at the bottom
            lineNumber.textContent = i;
        } else {
            lineNumber.textContent = i; // Line numbers start from 1
        }
        codeLinesContainer.appendChild(lineNumber);
    }
}

// Event handler for starting a drag event on a block
function dragStart(event) {
    dragged = event.target.closest(".box"); // Store the dragged block

    if (dragged) {
        event.dataTransfer.effectAllowed = 'move'; // Set the drag effect
    }
}

// Event handler to allow the block to be dropped
function dragOver(event) {
    event.preventDefault(); // Allow dropping by preventing default behavior
    const targetBlock = event.target.closest(".box");
    if (targetBlock) {
        targetBlock.classList.add('drop-target'); // Highlight the drop target
    }
}

// Event handler for handling the drop action
function drop(event) {
    event.preventDefault();

    if (dragged) {
        const targetBlock = event.target.closest(".box");
        if (targetBlock) {
            targetBlock.classList.remove('drop-target'); // Remove drop target highlight
            targetBlock.parentNode.insertBefore(dragged, targetBlock); // Move the dragged block before the target block
        } else if (event.target.id === "box-container") {
            event.target.appendChild(dragged); // Append the dragged block to the container if no target block
        }

        dragged = null; // Reset the dragged block
    }
}

// Function to toggle between showing and hiding block categories
function toggleCategory(categoryId) {
    const allCategories = document.querySelectorAll('.category-blocks');
    allCategories.forEach(category => {
        if (category.id === categoryId) {
            category.classList.toggle('hidden'); // Toggle visibility of the clicked category
        } else {
            category.classList.add('hidden'); // Hide all other categories
        }
    });
}

// Prevent click event from closing the category block (optional behavior)
document.querySelectorAll('.category-blocks button').forEach(button => {
    button.addEventListener('click', event => {
        event.stopPropagation(); // Stop click propagation to prevent closing the category
    });
});

// Event listener to handle dragging over the left-side container for deleting blocks
const codeContainer = document.querySelector(".code-container");
codeContainer.addEventListener("dragover", function (event) {
    event.preventDefault(); // Allow dropping by preventing default behavior
});
codeContainer.addEventListener("drop", function (event) {
    event.preventDefault();
    if (dragged) {
        dragged.remove(); // Remove the dragged block
        dragged = null; // Reset the dragged element
        updateLineNumbers(); // Update line numbers after block removal
    }
});

// Event listener to remove the drop target highlight when dragging leaves a block
document.addEventListener('dragleave', function (event) {
    const targetBlock = event.target.closest(".box");
    if (targetBlock) {
        targetBlock.classList.remove('drop-target'); // Remove drop target highlight
    }
});

// Event handler for selecting a block when clicked
function selectBlock(event) {
    const targetBlock = event.target.closest(".box");

    if (!targetBlock) return; // Exit if no block is found

    // Clear previous selection if any
    if (highlightedBlock) {
        highlightedBlock.classList.remove("selected");
    }

    // Highlight the clicked block
    highlightedBlock = targetBlock;
    highlightedBlock.classList.add("selected");

    event.stopPropagation(); // Prevent click event from propagating
}

// Event listener to deselect block when clicking outside the highlighted block
document.addEventListener("click", function (event) {
    if (highlightedBlock && !highlightedBlock.contains(event.target)) {
        highlightedBlock.classList.remove("selected"); // Remove highlight
        highlightedBlock = null; // Reset highlighted block
    }
});

// Event listener to delete the highlighted block when the "Delete" key is pressed
document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && highlightedBlock) {
        highlightedBlock.remove(); // Remove the highlighted block
        highlightedBlock = null; // Reset the highlighted block
        updateLineNumbers(); // Update line numbers after deletion
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
    pythontext.value = ""; // Clear the text area

    let blockChildElements = blockContainer.children; // Get all children/blocks from the box-container

    for (let i = 0; i < blockChildElements.length; i++) { // Loop through children/blocks
        // Add indentation based on the block's depth
        for (let j = 0; j < Number(blockChildElements[i].dataset.blockDepth); j++) {
            pythontext.value += "    "; // Add spaces for indentation
        }

        // Add blockID, blockType, XValue, Operator, and YValue to the text area
        pythontext.value += `blockID: ${blockChildElements[i].dataset.blockID} `;
        pythontext.value += `XValue: ${blockChildElements[i].dataset.blockXValue} `;
        pythontext.value += `Operator: ${blockChildElements[i].dataset.blockOperator} `;
        pythontext.value += `YValue: ${blockChildElements[i].dataset.blockYValue}\n`;

        console.log(blockChildElements[i]); // Log the block element for debugging
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
    var storeButton = document.getElementById("store-p");
    var pullButton = document.getElementById("pull-p");
    var toggleButton = document.getElementById("toggleButton");

    if (x.style.display === "block") {
        x.style.display = "none";
        y.style.display = "block";
        storeButton.style.display = "none";
        pullButton.style.display = "none";
        toggleButton.textContent = "Python";  // Change text to Python
        isPythonView = false; // Switch to Block view
    } else {
        x.style.display = "block";
        y.style.display = "none";
        storeButton.style.display = "inline";  // Show the store and pull buttons
        pullButton.style.display = "inline";
        toggleButton.textContent = "Block";  // Change text to Block
        isPythonView = true; // Switch to Python view
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