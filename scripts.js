/* 
newBlock(s, id) takes the name string from the button and creates a new element.
The new element is added to the "container" in the Result-Container section.
*/
let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;


function newBlock(s) {
    const container = document.getElementById("box-container");
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    newBlock.id = "box_" + ++blockCounter;

    const svgImage = document.createElement("img");
    svgImage.width = 24;
    svgImage.height = 24; 

    
    if (s === "greater_than") {
        svgImage.src = "svg_files/Operator/inequality_greater_than_block.svg";
    } else if (s === "less_than") {
        svgImage.src = "svg_files/Operator/inequality_less_than_block.svg";
    } else if (s === "equal") {
        svgImage.src = "svg_files/Operator/equal_block.svg";
    } else if (s === "not_equal") {
        svgImage.src = "svg_files/Operator/not_equal_block.svg";
    }

    // Append the new block to the container
    newBlock.appendChild(svgImage);
    container.appendChild(newBlock);

    // Add event listeners
    newBlock.draggable = true;
    newBlock.addEventListener("dragstart", dragStart);
    newBlock.addEventListener("dragover", dragOver);
    newBlock.addEventListener("drop", drop);
    newBlock.addEventListener("click", selectBlock);

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

// Function to delete a block by dragging to code-container (left side)
const codeContainer = document.querySelector(".code-container");

codeContainer.addEventListener("dragover", function(event) {
    event.preventDefault(); // Allow dropping
});
codeContainer.addEventListener("drop", function(event) {
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
document.addEventListener("click", function(event) {
    if (highlightedBlock && !highlightedBlock.contains(event.target)) {
        // Remove highlight and deselect the block
        highlightedBlock.classList.remove("selected");
        highlightedBlock = null;
    }
});

// Event listener to delete block when block is highlighted and "Delete" key is pressed
document.addEventListener("keydown", function(event) {
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

const t = document.getElementById("pythontext"); // creating const for element to pull from
ptext = t.value; // initializing variable.

// test function for storing textarea input as variable
function StoreBlob(){
    ptext = t.value;
    ptext = ptext.toString();
}

// test function for sending stored state to blob to read into textarea
function PullBlob(){
    const blob = new Blob([ptext], { type: 'text/plain' })
    blob.text().then(text => {
    t.value = text; // sends contents of blob to textarea
});

    // t.value = ptext; // less useful way to store information
}

function toggleView() {
    var x = document.getElementById("python-code-result");
    var y = document.getElementById("box-container");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none"
    } else {
        x.style.display = "none";
        y.style.display = "block"
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
document.addEventListener("keydown", function(event) {
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

const loginButton = document.getElementById("loginButton");
loginButton.addEventListener("click", function() {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");

    if (username === "user" && password === "password") {
        localStorage.setItem("loggedIn", "true");
        alert("Login successful!");
    } else {
        alert("Invalid credentials");
    }
});

const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", function() {
    const pythonCode = document.getElementById("pythontext").value;
    localStorage.setItem("savedCode", pythonCode);
    alert("Code saved locally!");
}); 